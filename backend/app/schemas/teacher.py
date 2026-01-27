from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime


class TeacherBase(BaseModel):
    employee_id: str
    name: str
    phone: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    join_date: Optional[date] = None
    address: Optional[str] = None


class TeacherCreate(TeacherBase):
    email: EmailStr
    password: str
    subject_ids: Optional[List[int]] = []
    class_ids: Optional[List[int]] = []


class TeacherUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    address: Optional[str] = None
    profile_image: Optional[str] = None


class TeacherResponse(TeacherBase):
    id: int
    user_id: int
    profile_image: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ClassInfo(BaseModel):
    id: int
    name: str
    section: Optional[str]
    total_students: int


class TeacherDashboard(BaseModel):
    teacher: TeacherResponse
    classes: List[ClassInfo]
    total_students: int
    pending_assignments_to_grade: int
    today_schedule: list
    recent_notices: list
