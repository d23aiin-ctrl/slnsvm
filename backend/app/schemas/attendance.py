from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from app.models.attendance import AttendanceStatus


class AttendanceBase(BaseModel):
    student_id: int
    date: date
    status: AttendanceStatus
    remarks: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceBulkCreate(BaseModel):
    date: date
    class_id: int
    records: List[dict]  # [{student_id: int, status: str, remarks: str}]


class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    remarks: Optional[str] = None


class AttendanceResponse(AttendanceBase):
    id: int
    marked_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class StudentAttendanceRecord(BaseModel):
    student_id: int
    student_name: str
    roll_no: Optional[int]
    status: AttendanceStatus
    remarks: Optional[str]


class ClassAttendanceResponse(BaseModel):
    date: date
    class_id: int
    class_name: str
    total_students: int
    present: int
    absent: int
    late: int
    records: List[StudentAttendanceRecord]


class AttendanceSummary(BaseModel):
    total_days: int
    present: int
    absent: int
    late: int
    excused: int
    percentage: float
