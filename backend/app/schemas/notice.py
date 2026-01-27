from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class NoticeBase(BaseModel):
    title: str
    content: str
    target_role: Optional[UserRole] = None
    priority: Optional[str] = "normal"
    attachment_url: Optional[str] = None
    expires_at: Optional[datetime] = None


class NoticeCreate(NoticeBase):
    pass


class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    target_role: Optional[UserRole] = None
    priority: Optional[str] = None
    is_active: Optional[bool] = None
    attachment_url: Optional[str] = None
    expires_at: Optional[datetime] = None


class NoticeResponse(NoticeBase):
    id: int
    is_active: bool
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
