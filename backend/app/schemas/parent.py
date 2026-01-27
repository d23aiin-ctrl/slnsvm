from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class ParentBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    occupation: Optional[str] = None
    address: Optional[str] = None
    relation: Optional[str] = None


class ParentCreate(ParentBase):
    email: EmailStr
    password: str


class ParentUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    occupation: Optional[str] = None
    address: Optional[str] = None
    relation: Optional[str] = None


class ParentResponse(ParentBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChildInfo(BaseModel):
    id: int
    name: str
    admission_no: str
    class_name: Optional[str]
    section: Optional[str]
    roll_no: Optional[int]
    attendance_percentage: float
    fee_status: str


class ParentDashboard(BaseModel):
    parent: ParentResponse
    children: List[ChildInfo]
    total_fee_pending: float
    recent_notices: list
