from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MessageParticipantType(str, Enum):
    PARENT = "parent"
    TEACHER = "teacher"


class MessageCreate(BaseModel):
    receiver_id: int
    receiver_type: MessageParticipantType
    content: str
    student_id: Optional[int] = None


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    sender_type: MessageParticipantType
    receiver_id: int
    receiver_type: MessageParticipantType
    content: str
    student_id: Optional[int] = None
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationTeacher(BaseModel):
    """Teacher info for conversation list"""
    id: int
    name: str
    subject: str
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0


class ConversationParent(BaseModel):
    """Parent info for conversation list (for teacher view)"""
    id: int
    name: str
    student_name: str
    student_class: str
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0


class ConversationMessages(BaseModel):
    """Messages in a conversation"""
    teacher: ConversationTeacher
    messages: List[MessageResponse]


class SendMessageRequest(BaseModel):
    """Request body for sending a message"""
    teacher_id: int
    content: str
    student_id: Optional[int] = None
