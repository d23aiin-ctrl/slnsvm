from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Enum as SQLEnum
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class AdmissionStatus(str, enum.Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    WAITLISTED = "waitlisted"


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String(255), nullable=False)
    dob = Column(Date, nullable=False)
    gender = Column(String(10))
    parent_name = Column(String(255), nullable=False)
    parent_phone = Column(String(20), nullable=False)
    parent_email = Column(String(255))
    address = Column(String(500))
    class_applied = Column(String(50), nullable=False)
    previous_school = Column(String(255))
    previous_class = Column(String(50))
    status = Column(SQLEnum(AdmissionStatus), default=AdmissionStatus.PENDING)
    remarks = Column(Text)
    documents = Column(Text)  # JSON string of document URLs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
