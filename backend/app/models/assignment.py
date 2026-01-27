from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    due_date = Column(Date, nullable=False)
    attachment_url = Column(String(500))
    max_marks = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    class_info = relationship("Class", back_populates="assignments")
    subject = relationship("Subject", back_populates="assignments")
    teacher = relationship("Teacher", back_populates="assignments")
    submissions = relationship("AssignmentSubmission", back_populates="assignment")


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    submission_url = Column(String(500))
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    marks_obtained = Column(Integer)
    feedback = Column(Text)
    graded_at = Column(DateTime(timezone=True))
    graded_by = Column(Integer, ForeignKey("teachers.id"))

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("Student")
