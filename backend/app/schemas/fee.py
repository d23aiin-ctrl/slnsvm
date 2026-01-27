from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from app.models.fee import FeeType, FeeStatus


class FeeBase(BaseModel):
    amount: Decimal
    fee_type: FeeType
    description: Optional[str] = None
    due_date: date
    academic_year: Optional[str] = None


class FeeCreate(FeeBase):
    student_id: int


class FeeBulkCreate(BaseModel):
    class_id: int
    amount: Decimal
    fee_type: FeeType
    description: Optional[str] = None
    due_date: date
    academic_year: Optional[str] = None


class FeeUpdate(BaseModel):
    amount: Optional[Decimal] = None
    due_date: Optional[date] = None
    status: Optional[FeeStatus] = None
    description: Optional[str] = None


class FeeResponse(FeeBase):
    id: int
    student_id: int
    student_name: Optional[str] = None
    paid_date: Optional[date]
    paid_amount: Optional[Decimal]
    status: FeeStatus
    payment_method: Optional[str]
    transaction_id: Optional[str]
    receipt_number: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class FeePayment(BaseModel):
    fee_id: int
    amount: Decimal
    payment_method: str
    transaction_id: Optional[str] = None


class FeeSummary(BaseModel):
    total_fees: Decimal
    total_paid: Decimal
    total_pending: Decimal
    overdue_amount: Decimal
    fees: List[FeeResponse]
