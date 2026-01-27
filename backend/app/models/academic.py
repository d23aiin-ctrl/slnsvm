from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SQLEnum, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class DayOfWeek(str, enum.Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)  # e.g., "Class 10", "Class 5"
    section = Column(String(10))  # e.g., "A", "B", "C"
    academic_year = Column(String(20), nullable=False)  # e.g., "2024-25"
    class_teacher_id = Column(Integer, ForeignKey("teachers.id"))
    room_number = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    students = relationship("Student", back_populates="class_info")
    subjects = relationship("Subject", back_populates="class_info")
    teachers = relationship("Teacher", secondary="teacher_classes", back_populates="classes")
    timetable_entries = relationship("Timetable", back_populates="class_info")
    assignments = relationship("Assignment", back_populates="class_info")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"))
    description = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    class_info = relationship("Class", back_populates="subjects")
    teachers = relationship("Teacher", secondary="teacher_subjects", back_populates="subjects")
    timetable_entries = relationship("Timetable", back_populates="subject")
    assignments = relationship("Assignment", back_populates="subject")


class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    day = Column(SQLEnum(DayOfWeek), nullable=False)
    period = Column(Integer, nullable=False)  # 1, 2, 3, etc.
    start_time = Column(Time)
    end_time = Column(Time)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    room = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    class_info = relationship("Class", back_populates="timetable_entries")
    subject = relationship("Subject", back_populates="timetable_entries")
    teacher = relationship("Teacher", back_populates="timetable_entries")
