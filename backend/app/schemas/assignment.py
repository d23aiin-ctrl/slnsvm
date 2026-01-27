from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: date
    attachment_url: Optional[str] = None
    max_marks: Optional[int] = None


class AssignmentCreate(AssignmentBase):
    class_id: int
    subject_id: int


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    attachment_url: Optional[str] = None
    max_marks: Optional[int] = None


class AssignmentResponse(AssignmentBase):
    id: int
    class_id: int
    subject_id: int
    teacher_id: int
    class_name: Optional[str] = None
    subject_name: Optional[str] = None
    teacher_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SubmissionCreate(BaseModel):
    assignment_id: int
    submission_url: Optional[str] = None


class SubmissionGrade(BaseModel):
    marks_obtained: int
    feedback: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    student_name: Optional[str] = None
    submission_url: Optional[str]
    submitted_at: datetime
    marks_obtained: Optional[int]
    feedback: Optional[str]
    graded_at: Optional[datetime]

    class Config:
        from_attributes = True
