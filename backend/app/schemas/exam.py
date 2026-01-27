from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


class ExamBase(BaseModel):
    name: str
    academic_year: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None


class ExamCreate(ExamBase):
    pass


class ExamUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None


class ExamResponse(ExamBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ExamScheduleBase(BaseModel):
    exam_id: int
    class_id: int
    subject_id: int
    exam_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    max_marks: int
    passing_marks: Optional[int] = None
    room: Optional[str] = None


class ExamScheduleCreate(ExamScheduleBase):
    pass


class ExamScheduleResponse(ExamScheduleBase):
    id: int
    exam_name: Optional[str] = None
    class_name: Optional[str] = None
    subject_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ExamResultBase(BaseModel):
    exam_id: int
    student_id: int
    subject_id: int
    marks_obtained: Decimal
    grade: Optional[str] = None
    remarks: Optional[str] = None


class ExamResultCreate(ExamResultBase):
    pass


class StudentMarkEntry(BaseModel):
    student_id: int
    marks_obtained: Decimal
    grade: Optional[str] = None
    remarks: Optional[str] = None


class ExamResultBulkCreate(BaseModel):
    exam_id: int
    subject_id: int
    results: List[StudentMarkEntry]


class TeacherMarksEntry(BaseModel):
    exam_id: int
    subject_id: int
    results: List[StudentMarkEntry]


class ExamResultResponse(ExamResultBase):
    id: int
    student_name: Optional[str] = None
    subject_name: Optional[str] = None
    max_marks: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class StudentResultCard(BaseModel):
    student_id: int
    student_name: str
    exam_name: str
    results: List[ExamResultResponse]
    total_marks: Decimal
    total_obtained: Decimal
    percentage: float
    overall_grade: str
