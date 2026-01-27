from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Numeric, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # e.g., "Mid-Term", "Final"
    academic_year = Column(String(20), nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    schedules = relationship("ExamSchedule", back_populates="exam")
    results = relationship("ExamResult", back_populates="exam")


class ExamSchedule(Base):
    __tablename__ = "exam_schedules"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    exam_date = Column(Date, nullable=False)
    start_time = Column(String(10))
    end_time = Column(String(10))
    max_marks = Column(Integer, nullable=False)
    passing_marks = Column(Integer)
    room = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    exam = relationship("Exam", back_populates="schedules")
    class_info = relationship("Class")
    subject = relationship("Subject")


class ExamResult(Base):
    __tablename__ = "exam_results"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    marks_obtained = Column(Numeric(5, 2))
    grade = Column(String(5))
    remarks = Column(String(255))
    entered_by = Column(Integer, ForeignKey("teachers.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    exam = relationship("Exam", back_populates="results")
    student = relationship("Student")
    subject = relationship("Subject")
