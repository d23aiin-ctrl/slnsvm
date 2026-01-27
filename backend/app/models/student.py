from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    admission_no = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"))
    section = Column(String(10))
    roll_no = Column(Integer)
    dob = Column(Date)
    gender = Column(String(10))
    address = Column(String(500))
    phone = Column(String(20))
    parent_id = Column(Integer, ForeignKey("parents.id"))
    blood_group = Column(String(10))
    profile_image = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="student_profile")
    parent = relationship("Parent", back_populates="children")
    class_info = relationship("Class", back_populates="students")
    attendance_records = relationship("Attendance", back_populates="student")
    fee_records = relationship("Fee", back_populates="student")
