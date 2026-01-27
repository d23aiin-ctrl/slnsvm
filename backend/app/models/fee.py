from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Numeric, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class FeeType(str, enum.Enum):
    TUITION = "tuition"
    ADMISSION = "admission"
    EXAM = "exam"
    TRANSPORT = "transport"
    LIBRARY = "library"
    LABORATORY = "laboratory"
    SPORTS = "sports"
    OTHER = "other"


class FeeStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"
    OVERDUE = "overdue"
    WAIVED = "waived"


class Fee(Base):
    __tablename__ = "fees"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    fee_type = Column(SQLEnum(FeeType), nullable=False)
    description = Column(String(255))
    due_date = Column(Date, nullable=False)
    paid_date = Column(Date)
    paid_amount = Column(Numeric(10, 2))
    status = Column(SQLEnum(FeeStatus), default=FeeStatus.PENDING)
    payment_method = Column(String(50))
    transaction_id = Column(String(100))
    receipt_number = Column(String(50))
    academic_year = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    student = relationship("Student", back_populates="fee_records")
