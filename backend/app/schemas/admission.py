from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from app.models.admission import AdmissionStatus


class AdmissionBase(BaseModel):
    student_name: str
    dob: date
    gender: Optional[str] = None
    parent_name: str
    parent_phone: str
    parent_email: Optional[EmailStr] = None
    address: Optional[str] = None
    class_applied: str
    previous_school: Optional[str] = None
    previous_class: Optional[str] = None


class AdmissionCreate(AdmissionBase):
    pass


class AdmissionUpdate(BaseModel):
    status: Optional[AdmissionStatus] = None
    remarks: Optional[str] = None
    documents: Optional[str] = None


class AdmissionResponse(AdmissionBase):
    id: int
    status: AdmissionStatus
    remarks: Optional[str]
    documents: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class AdmissionInquiry(BaseModel):
    student_name: str
    parent_name: str
    parent_phone: str
    parent_email: Optional[EmailStr] = None
    class_interested: str
    message: Optional[str] = None
