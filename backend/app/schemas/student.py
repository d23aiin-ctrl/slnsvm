from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime


class StudentBase(BaseModel):
    admission_no: str
    name: str
    section: Optional[str] = None
    roll_no: Optional[int] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None


class StudentCreate(StudentBase):
    email: EmailStr
    password: str
    class_id: Optional[int] = None
    parent_id: Optional[int] = None


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    section: Optional[str] = None
    roll_no: Optional[int] = None
    class_id: Optional[int] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    profile_image: Optional[str] = None


class StudentResponse(StudentBase):
    id: int
    user_id: int
    class_id: Optional[int]
    parent_id: Optional[int]
    profile_image: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class StudentDashboard(BaseModel):
    student: StudentResponse
    attendance_percentage: float
    pending_assignments: int
    upcoming_exams: int
    fee_pending: float
    recent_notices: list
