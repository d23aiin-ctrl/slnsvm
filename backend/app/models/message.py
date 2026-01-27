from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class MessageParticipantType(str, enum.Enum):
    PARENT = "parent"
    TEACHER = "teacher"


class Message(Base):
    """
    Model for parent-teacher communication messages.
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    # Sender info
    sender_id = Column(Integer, nullable=False)  # Parent or Teacher ID
    sender_type = Column(SQLEnum(MessageParticipantType), nullable=False)

    # Receiver info
    receiver_id = Column(Integer, nullable=False)  # Parent or Teacher ID
    receiver_type = Column(SQLEnum(MessageParticipantType), nullable=False)

    # Message content
    content = Column(Text, nullable=False)

    # Related student (context for the conversation)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)

    # Status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", backref="messages")
