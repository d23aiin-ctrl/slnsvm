from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# Many-to-many relationship between teachers and subjects
teacher_subjects = Table(
    "teacher_subjects",
    Base.metadata,
    Column("teacher_id", Integer, ForeignKey("teachers.id"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subjects.id"), primary_key=True),
)

# Many-to-many relationship between teachers and classes
teacher_classes = Table(
    "teacher_classes",
    Base.metadata,
    Column("teacher_id", Integer, ForeignKey("teachers.id"), primary_key=True),
    Column("class_id", Integer, ForeignKey("classes.id"), primary_key=True),
)


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    qualification = Column(String(255))
    experience_years = Column(Integer)
    join_date = Column(Date)
    address = Column(String(500))
    profile_image = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="teacher_profile")
    subjects = relationship("Subject", secondary=teacher_subjects, back_populates="teachers")
    classes = relationship("Class", secondary=teacher_classes, back_populates="teachers")
    assignments = relationship("Assignment", back_populates="teacher")
    timetable_entries = relationship("Timetable", back_populates="teacher")
