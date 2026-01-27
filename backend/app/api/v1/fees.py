from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Fee, FeeStatus, Student
from app.schemas import FeeResponse

router = APIRouter(prefix="/fees", tags=["Fees"])


@router.get("/", response_model=List[FeeResponse])
async def get_fees(
    status: Optional[FeeStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Fee)
    if status:
        query = query.filter(Fee.status == status)
    fees = query.all()

    result = []
    for f in fees:
        student = db.query(Student).filter(Student.id == f.student_id).first()
        result.append(FeeResponse(
            id=f.id,
            student_id=f.student_id,
            student_name=student.name if student else None,
            amount=f.amount,
            fee_type=f.fee_type,
            description=f.description,
            due_date=f.due_date,
            paid_date=f.paid_date,
            paid_amount=f.paid_amount,
            status=f.status,
            payment_method=f.payment_method,
            transaction_id=f.transaction_id,
            receipt_number=f.receipt_number,
            academic_year=f.academic_year,
            created_at=f.created_at
        ))
    return result


@router.get("/{fee_id}", response_model=FeeResponse)
async def get_fee(
    fee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fee = db.query(Fee).filter(Fee.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee not found")

    student = db.query(Student).filter(Student.id == fee.student_id).first()
    return FeeResponse(
        id=fee.id,
        student_id=fee.student_id,
        student_name=student.name if student else None,
        amount=fee.amount,
        fee_type=fee.fee_type,
        description=fee.description,
        due_date=fee.due_date,
        paid_date=fee.paid_date,
        paid_amount=fee.paid_amount,
        status=fee.status,
        payment_method=fee.payment_method,
        transaction_id=fee.transaction_id,
        receipt_number=fee.receipt_number,
        academic_year=fee.academic_year,
        created_at=fee.created_at
    )
