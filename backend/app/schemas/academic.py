from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, time
from app.models.academic import DayOfWeek


class ClassBase(BaseModel):
    name: str
    section: Optional[str] = None
    academic_year: str
    room_number: Optional[str] = None


class ClassCreate(ClassBase):
    class_teacher_id: Optional[int] = None


class ClassUpdate(BaseModel):
    name: Optional[str] = None
    section: Optional[str] = None
    academic_year: Optional[str] = None
    class_teacher_id: Optional[int] = None
    room_number: Optional[str] = None


class ClassResponse(ClassBase):
    id: int
    class_teacher_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class SubjectBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class SubjectCreate(SubjectBase):
    class_id: Optional[int] = None


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    class_id: Optional[int] = None
    description: Optional[str] = None


class SubjectResponse(SubjectBase):
    id: int
    class_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class TimetableEntry(BaseModel):
    id: int
    day: DayOfWeek
    period: int
    start_time: Optional[time]
    end_time: Optional[time]
    subject_name: Optional[str]
    teacher_name: Optional[str]
    room: Optional[str]


class TimetableCreate(BaseModel):
    class_id: int
    day: DayOfWeek
    period: int
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    subject_id: Optional[int] = None
    teacher_id: Optional[int] = None
    room: Optional[str] = None


class TimetableResponse(BaseModel):
    class_id: int
    class_name: str
    entries: List[TimetableEntry]
