from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import razorpay
import hmac
import hashlib
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User
from app.models.fee import Fee, FeeStatus
from pydantic import BaseModel

router = APIRouter()

# Initialize Razorpay client (will be None if keys not configured)
razorpay_client = None
if hasattr(settings, 'RAZORPAY_KEY_ID') and settings.RAZORPAY_KEY_ID:
    razorpay_client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


class CreateOrderRequest(BaseModel):
    fee_id: int
    amount: float  # Amount in rupees


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int  # Amount in paise
    currency: str
    key_id: str
    fee_id: int
    name: str
    description: str
    prefill_email: Optional[str] = None
    prefill_contact: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    fee_id: int


class PaymentResponse(BaseModel):
    success: bool
    message: str
    transaction_id: Optional[str] = None
    receipt_number: Optional[str] = None


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_payment_order(
    request: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a Razorpay order for fee payment."""

    # Check if Razorpay is configured
    if not razorpay_client:
        raise HTTPException(
            status_code=503,
            detail="Payment gateway not configured. Please contact administrator."
        )

    # Get the fee record
    fee = db.query(Fee).filter(Fee.id == request.fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")

    # Verify the user has access to this fee
    if current_user.role == "parent":
        # Verify parent owns this student
        pass  # Add verification logic

    # Check if already paid
    if fee.status == FeeStatus.paid:
        raise HTTPException(status_code=400, detail="Fee already paid")

    # Amount in paise (Razorpay uses smallest currency unit)
    amount_paise = int(request.amount * 100)

    # Create Razorpay order
    order_data = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"fee_{fee.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "notes": {
            "fee_id": str(fee.id),
            "student_id": str(fee.student_id),
            "fee_type": fee.fee_type.value if fee.fee_type else "tuition"
        }
    }

    try:
        order = razorpay_client.order.create(data=order_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

    return CreateOrderResponse(
        order_id=order['id'],
        amount=amount_paise,
        currency="INR",
        key_id=settings.RAZORPAY_KEY_ID,
        fee_id=fee.id,
        name="Sri Laxmi Narayan Saraswati Vidya Mandir",
        description=f"Fee Payment - {fee.fee_type.value if fee.fee_type else 'Tuition Fee'}",
        prefill_email=current_user.email,
        prefill_contact=None  # Add phone if available
    )


@router.post("/verify", response_model=PaymentResponse)
async def verify_payment(
    request: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify Razorpay payment and update fee status."""

    if not razorpay_client:
        raise HTTPException(
            status_code=503,
            detail="Payment gateway not configured"
        )

    # Verify signature
    try:
        params_dict = {
            'razorpay_order_id': request.razorpay_order_id,
            'razorpay_payment_id': request.razorpay_payment_id,
            'razorpay_signature': request.razorpay_signature
        }
        razorpay_client.utility.verify_payment_signature(params_dict)
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    # Update fee record
    fee = db.query(Fee).filter(Fee.id == request.fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")

    # Generate receipt number
    receipt_number = f"SLNSVM-{datetime.now().strftime('%Y%m%d')}-{fee.id}"

    fee.status = FeeStatus.paid
    fee.paid_date = datetime.now()
    fee.payment_method = "online_razorpay"
    fee.transaction_id = request.razorpay_payment_id
    fee.receipt_number = receipt_number

    db.commit()

    return PaymentResponse(
        success=True,
        message="Payment successful! Fee has been marked as paid.",
        transaction_id=request.razorpay_payment_id,
        receipt_number=receipt_number
    )


@router.get("/status/{fee_id}")
async def get_payment_status(
    fee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payment status for a fee."""

    fee = db.query(Fee).filter(Fee.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")

    return {
        "fee_id": fee.id,
        "status": fee.status.value,
        "amount": float(fee.amount),
        "paid_date": fee.paid_date,
        "transaction_id": fee.transaction_id,
        "receipt_number": fee.receipt_number
    }
