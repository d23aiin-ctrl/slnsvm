from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, time
from app.core.database import get_db
from app.core.security import get_current_user, require_role, get_password_hash
from app.models import (
    User, UserRole, Student, Parent, Teacher, Admin, Class, Subject,
    Fee, FeeStatus, FeeType, Notice, Admission, AdmissionStatus,
    Attendance, AttendanceStatus, Timetable, DayOfWeek,
    Exam, ExamSchedule, ExamResult
)
from app.schemas import (
    StudentCreate, StudentUpdate, StudentResponse,
    TeacherCreate, TeacherUpdate, TeacherResponse,
    FeeCreate, FeeBulkCreate, FeeUpdate, FeeResponse,
    NoticeCreate, NoticeUpdate, NoticeResponse,
    AdmissionUpdate, AdmissionResponse,
    ClassCreate, ClassUpdate, ClassResponse,
    SubjectCreate, SubjectUpdate, SubjectResponse,
    AttendanceCreate, AttendanceBulkCreate, AttendanceResponse,
    StudentAttendanceRecord, ClassAttendanceResponse, AttendanceSummary,
    TimetableCreate, TimetableEntry, TimetableResponse,
    ExamCreate, ExamUpdate, ExamResponse,
    ExamScheduleCreate, ExamScheduleResponse,
    ExamResultCreate, ExamResultBulkCreate, ExamResultResponse
)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
async def get_admin_dashboard(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    total_students = db.query(Student).count()
    total_teachers = db.query(Teacher).count()
    total_parents = db.query(Parent).count()
    total_classes = db.query(Class).count()

    pending_admissions = db.query(Admission).filter(
        Admission.status == AdmissionStatus.PENDING
    ).count()

    total_fee_collected = db.query(func.sum(Fee.paid_amount)).filter(
        Fee.status == FeeStatus.PAID
    ).scalar() or 0

    total_fee_pending = db.query(func.sum(Fee.amount)).filter(
        Fee.status.in_([FeeStatus.PENDING, FeeStatus.OVERDUE])
    ).scalar() or 0

    recent_admissions = db.query(Admission).order_by(
        Admission.created_at.desc()
    ).limit(5).all()

    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_parents": total_parents,
        "total_classes": total_classes,
        "pending_admissions": pending_admissions,
        "total_fee_collected": float(total_fee_collected),
        "total_fee_pending": float(total_fee_pending),
        "recent_admissions": [AdmissionResponse.model_validate(a) for a in recent_admissions]
    }


# Student Management
@router.get("/students", response_model=List[StudentResponse])
async def list_students(
    skip: int = 0,
    limit: int = 100,
    class_id: Optional[int] = None,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if class_id:
        query = query.filter(Student.class_id == class_id)
    students = query.offset(skip).limit(limit).all()
    return students


@router.post("/students", response_model=StudentResponse)
async def create_student(
    student_data: StudentCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    # Create user first
    user = User(
        email=student_data.email,
        password_hash=get_password_hash(student_data.password),
        role=UserRole.STUDENT
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    student = Student(
        user_id=user.id,
        admission_no=student_data.admission_no,
        name=student_data.name,
        class_id=student_data.class_id,
        section=student_data.section,
        roll_no=student_data.roll_no,
        dob=student_data.dob,
        gender=student_data.gender,
        address=student_data.address,
        phone=student_data.phone,
        parent_id=student_data.parent_id,
        blood_group=student_data.blood_group
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("/students/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.put("/students/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    student_data: StudentUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for field, value in student_data.model_dump(exclude_unset=True).items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)
    return student


@router.delete("/students/{student_id}")
async def delete_student(
    student_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    user = db.query(User).filter(User.id == student.user_id).first()

    db.delete(student)
    if user:
        db.delete(user)
    db.commit()
    return {"message": "Student deleted successfully"}


# Teacher Management
@router.get("/teachers", response_model=List[TeacherResponse])
async def list_teachers(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    teachers = db.query(Teacher).offset(skip).limit(limit).all()
    return teachers


@router.post("/teachers", response_model=TeacherResponse)
async def create_teacher(
    teacher_data: TeacherCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    user = User(
        email=teacher_data.email,
        password_hash=get_password_hash(teacher_data.password),
        role=UserRole.TEACHER
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    teacher = Teacher(
        user_id=user.id,
        employee_id=teacher_data.employee_id,
        name=teacher_data.name,
        phone=teacher_data.phone,
        qualification=teacher_data.qualification,
        experience_years=teacher_data.experience_years,
        join_date=teacher_data.join_date,
        address=teacher_data.address
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    # Assign subjects and classes
    if teacher_data.subject_ids:
        subjects = db.query(Subject).filter(Subject.id.in_(teacher_data.subject_ids)).all()
        teacher.subjects = subjects

    if teacher_data.class_ids:
        classes = db.query(Class).filter(Class.id.in_(teacher_data.class_ids)).all()
        teacher.classes = classes

    db.commit()
    db.refresh(teacher)
    return teacher


@router.put("/teachers/{teacher_id}", response_model=TeacherResponse)
async def update_teacher(
    teacher_id: int,
    teacher_data: TeacherUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    for field, value in teacher_data.model_dump(exclude_unset=True).items():
        setattr(teacher, field, value)

    db.commit()
    db.refresh(teacher)
    return teacher


@router.delete("/teachers/{teacher_id}")
async def delete_teacher(
    teacher_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    user = db.query(User).filter(User.id == teacher.user_id).first()

    db.delete(teacher)
    if user:
        db.delete(user)
    db.commit()
    return {"message": "Teacher deleted successfully"}


# Fee Management
@router.get("/fees", response_model=List[FeeResponse])
async def list_fees(
    skip: int = 0,
    limit: int = 100,
    status: Optional[FeeStatus] = None,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    query = db.query(Fee)
    if status:
        query = query.filter(Fee.status == status)
    fees = query.offset(skip).limit(limit).all()

    result = []
    for f in fees:
        student = db.query(Student).filter(Student.id == f.student_id).first()
        result.append(FeeResponse(
            id=f.id,
            student_id=f.student_id,
            student_name=student.name if student else None,
            amount=f.amount,
            fee_type=f.fee_type,
            description=f.description,
            due_date=f.due_date,
            paid_date=f.paid_date,
            paid_amount=f.paid_amount,
            status=f.status,
            payment_method=f.payment_method,
            transaction_id=f.transaction_id,
            receipt_number=f.receipt_number,
            academic_year=f.academic_year,
            created_at=f.created_at
        ))
    return result


@router.post("/fees", response_model=FeeResponse)
async def create_fee(
    fee_data: FeeCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    fee = Fee(
        student_id=fee_data.student_id,
        amount=fee_data.amount,
        fee_type=fee_data.fee_type,
        description=fee_data.description,
        due_date=fee_data.due_date,
        academic_year=fee_data.academic_year
    )
    db.add(fee)
    db.commit()
    db.refresh(fee)

    student = db.query(Student).filter(Student.id == fee.student_id).first()
    return FeeResponse(
        id=fee.id,
        student_id=fee.student_id,
        student_name=student.name if student else None,
        amount=fee.amount,
        fee_type=fee.fee_type,
        description=fee.description,
        due_date=fee.due_date,
        paid_date=fee.paid_date,
        paid_amount=fee.paid_amount,
        status=fee.status,
        payment_method=fee.payment_method,
        transaction_id=fee.transaction_id,
        receipt_number=fee.receipt_number,
        academic_year=fee.academic_year,
        created_at=fee.created_at
    )


@router.post("/fees/bulk")
async def create_fees_bulk(
    fee_data: FeeBulkCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    students = db.query(Student).filter(Student.class_id == fee_data.class_id).all()

    for student in students:
        fee = Fee(
            student_id=student.id,
            amount=fee_data.amount,
            fee_type=fee_data.fee_type,
            description=fee_data.description,
            due_date=fee_data.due_date,
            academic_year=fee_data.academic_year
        )
        db.add(fee)

    db.commit()
    return {"message": f"Fees created for {len(students)} students"}


# Admission Management
@router.get("/admissions", response_model=List[AdmissionResponse])
async def list_admissions(
    skip: int = 0,
    limit: int = 100,
    status: Optional[AdmissionStatus] = None,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    query = db.query(Admission)
    if status:
        query = query.filter(Admission.status == status)
    admissions = query.order_by(Admission.created_at.desc()).offset(skip).limit(limit).all()
    return admissions


@router.put("/admissions/{admission_id}", response_model=AdmissionResponse)
async def update_admission(
    admission_id: int,
    admission_data: AdmissionUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    admission = db.query(Admission).filter(Admission.id == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")

    for field, value in admission_data.model_dump(exclude_unset=True).items():
        setattr(admission, field, value)

    db.commit()
    db.refresh(admission)
    return admission


# Notice Management
@router.get("/notices", response_model=List[NoticeResponse])
async def list_notices(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    notices = db.query(Notice).order_by(Notice.created_at.desc()).offset(skip).limit(limit).all()
    return notices


@router.post("/notices", response_model=NoticeResponse)
async def create_notice(
    notice_data: NoticeCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    notice = Notice(
        title=notice_data.title,
        content=notice_data.content,
        target_role=notice_data.target_role,
        priority=notice_data.priority,
        attachment_url=notice_data.attachment_url,
        expires_at=notice_data.expires_at,
        created_by=current_user.id
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice


@router.put("/notices/{notice_id}", response_model=NoticeResponse)
async def update_notice(
    notice_id: int,
    notice_data: NoticeUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    for field, value in notice_data.model_dump(exclude_unset=True).items():
        setattr(notice, field, value)

    db.commit()
    db.refresh(notice)
    return notice


@router.delete("/notices/{notice_id}")
async def delete_notice(
    notice_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    db.delete(notice)
    db.commit()
    return {"message": "Notice deleted successfully"}


# Class Management
@router.get("/classes")
async def list_classes(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get all classes with student count and class teacher info"""
    classes = db.query(Class).all()

    result = []
    for c in classes:
        student_count = db.query(Student).filter(Student.class_id == c.id).count()
        class_teacher_name = None

        if c.class_teacher_id:
            teacher = db.query(Teacher).filter(Teacher.id == c.class_teacher_id).first()
            if teacher:
                class_teacher_name = teacher.name

        result.append({
            "id": c.id,
            "name": c.name,
            "section": c.section,
            "academic_year": c.academic_year,
            "room_number": c.room_number,
            "class_teacher_id": c.class_teacher_id,
            "class_teacher_name": class_teacher_name,
            "student_count": student_count
        })

    return result


@router.post("/classes", response_model=ClassResponse)
async def create_class(
    class_data: ClassCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    new_class = Class(
        name=class_data.name,
        section=class_data.section,
        academic_year=class_data.academic_year,
        class_teacher_id=class_data.class_teacher_id,
        room_number=class_data.room_number
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class


@router.put("/classes/{class_id}", response_model=ClassResponse)
async def update_class(
    class_id: int,
    class_data: ClassUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")

    for field, value in class_data.model_dump(exclude_unset=True).items():
        setattr(class_obj, field, value)

    db.commit()
    db.refresh(class_obj)
    return class_obj


@router.delete("/classes/{class_id}")
async def delete_class(
    class_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")

    db.delete(class_obj)
    db.commit()
    return {"message": "Class deleted successfully"}


# Subject Management
@router.get("/subjects", response_model=List[SubjectResponse])
async def list_subjects(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    subjects = db.query(Subject).all()
    return subjects


@router.post("/subjects", response_model=SubjectResponse)
async def create_subject(
    subject_data: SubjectCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    subject = Subject(
        name=subject_data.name,
        code=subject_data.code,
        class_id=subject_data.class_id,
        description=subject_data.description
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


# Attendance Management
@router.get("/attendance", response_model=List[AttendanceResponse])
async def list_attendance(
    class_id: Optional[int] = None,
    attendance_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """List attendance records with optional filters"""
    query = db.query(Attendance)

    if attendance_date:
        query = query.filter(Attendance.date == attendance_date)

    if class_id:
        student_ids = db.query(Student.id).filter(Student.class_id == class_id).subquery()
        query = query.filter(Attendance.student_id.in_(student_ids))

    return query.order_by(Attendance.date.desc()).offset(skip).limit(limit).all()


@router.get("/attendance/class/{class_id}/date/{attendance_date}")
async def get_class_attendance(
    class_id: int,
    attendance_date: date,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get attendance for a specific class on a specific date"""
    class_info = db.query(Class).filter(Class.id == class_id).first()
    if not class_info:
        raise HTTPException(status_code=404, detail="Class not found")

    students = db.query(Student).filter(Student.class_id == class_id).all()

    records = []
    present = absent = late = 0

    for student in students:
        attendance = db.query(Attendance).filter(
            Attendance.student_id == student.id,
            Attendance.date == attendance_date
        ).first()

        status = attendance.status if attendance else None
        remarks = attendance.remarks if attendance else None

        if status == AttendanceStatus.PRESENT:
            present += 1
        elif status == AttendanceStatus.ABSENT:
            absent += 1
        elif status == AttendanceStatus.LATE:
            late += 1

        records.append(StudentAttendanceRecord(
            student_id=student.id,
            student_name=student.name,
            roll_no=student.roll_no,
            status=status or AttendanceStatus.ABSENT,
            remarks=remarks
        ))

    return ClassAttendanceResponse(
        date=attendance_date,
        class_id=class_id,
        class_name=f"{class_info.name} {class_info.section or ''}".strip(),
        total_students=len(students),
        present=present,
        absent=absent,
        late=late,
        records=records
    )


@router.post("/attendance/bulk")
async def mark_bulk_attendance(
    data: AttendanceBulkCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Mark attendance for multiple students at once"""
    # Get admin's associated teacher if any, or use None
    admin = db.query(Admin).filter(Admin.user_id == current_user.id).first()

    for record in data.records:
        existing = db.query(Attendance).filter(
            Attendance.student_id == record["student_id"],
            Attendance.date == data.date
        ).first()

        status = AttendanceStatus(record["status"])
        remarks = record.get("remarks")

        if existing:
            existing.status = status
            existing.remarks = remarks
        else:
            new_attendance = Attendance(
                student_id=record["student_id"],
                date=data.date,
                status=status,
                remarks=remarks
            )
            db.add(new_attendance)

    db.commit()
    return {"message": f"Attendance marked for {len(data.records)} students"}


@router.get("/attendance/summary/{student_id}")
async def get_student_attendance_summary(
    student_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get attendance summary for a student"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    query = db.query(Attendance).filter(Attendance.student_id == student_id)

    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)

    records = query.all()
    total = len(records)
    present = sum(1 for r in records if r.status == AttendanceStatus.PRESENT)
    absent = sum(1 for r in records if r.status == AttendanceStatus.ABSENT)
    late = sum(1 for r in records if r.status == AttendanceStatus.LATE)
    excused = sum(1 for r in records if r.status == AttendanceStatus.EXCUSED)

    percentage = (present / total * 100) if total > 0 else 0

    return AttendanceSummary(
        total_days=total,
        present=present,
        absent=absent,
        late=late,
        excused=excused,
        percentage=round(percentage, 2)
    )


# Timetable Management
@router.get("/timetable/class/{class_id}")
async def get_class_timetable(
    class_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get complete timetable for a class"""
    class_info = db.query(Class).filter(Class.id == class_id).first()
    if not class_info:
        raise HTTPException(status_code=404, detail="Class not found")

    entries = db.query(Timetable).filter(Timetable.class_id == class_id).all()

    result = []
    for entry in entries:
        subject = db.query(Subject).filter(Subject.id == entry.subject_id).first()
        teacher = db.query(Teacher).filter(Teacher.id == entry.teacher_id).first()

        result.append(TimetableEntry(
            id=entry.id,
            day=entry.day,
            period=entry.period,
            start_time=entry.start_time,
            end_time=entry.end_time,
            subject_name=subject.name if subject else None,
            teacher_name=teacher.name if teacher else None,
            room=entry.room
        ))

    return TimetableResponse(
        class_id=class_id,
        class_name=f"{class_info.name} {class_info.section or ''}".strip(),
        entries=result
    )


@router.post("/timetable")
async def create_timetable_entry(
    data: TimetableCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Create a new timetable entry"""
    # Check if slot already exists
    existing = db.query(Timetable).filter(
        Timetable.class_id == data.class_id,
        Timetable.day == data.day,
        Timetable.period == data.period
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Timetable slot already exists for this class/day/period"
        )

    entry = Timetable(
        class_id=data.class_id,
        day=data.day,
        period=data.period,
        start_time=data.start_time,
        end_time=data.end_time,
        subject_id=data.subject_id,
        teacher_id=data.teacher_id,
        room=data.room
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return {"message": "Timetable entry created", "id": entry.id}


@router.put("/timetable/{entry_id}")
async def update_timetable_entry(
    entry_id: int,
    data: TimetableCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Update a timetable entry"""
    entry = db.query(Timetable).filter(Timetable.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    entry.day = data.day
    entry.period = data.period
    entry.start_time = data.start_time
    entry.end_time = data.end_time
    entry.subject_id = data.subject_id
    entry.teacher_id = data.teacher_id
    entry.room = data.room

    db.commit()
    return {"message": "Timetable entry updated"}


@router.delete("/timetable/{entry_id}")
async def delete_timetable_entry(
    entry_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Delete a timetable entry"""
    entry = db.query(Timetable).filter(Timetable.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    db.delete(entry)
    db.commit()
    return {"message": "Timetable entry deleted"}


# Exam Management
@router.get("/exams", response_model=List[ExamResponse])
async def list_exams(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """List all exams"""
    return db.query(Exam).order_by(Exam.start_date.desc()).offset(skip).limit(limit).all()


@router.post("/exams", response_model=ExamResponse)
async def create_exam(
    data: ExamCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Create a new exam"""
    exam = Exam(
        name=data.name,
        academic_year=data.academic_year,
        start_date=data.start_date,
        end_date=data.end_date,
        description=data.description
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam


@router.get("/exams/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get exam details"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam


@router.put("/exams/{exam_id}", response_model=ExamResponse)
async def update_exam(
    exam_id: int,
    data: ExamUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Update an exam"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(exam, field, value)

    db.commit()
    db.refresh(exam)
    return exam


@router.delete("/exams/{exam_id}")
async def delete_exam(
    exam_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Delete an exam"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    db.delete(exam)
    db.commit()
    return {"message": "Exam deleted"}


# Exam Schedules
@router.get("/exams/{exam_id}/schedules")
async def get_exam_schedules(
    exam_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get all schedules for an exam"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    schedules = db.query(ExamSchedule).filter(ExamSchedule.exam_id == exam_id).all()

    result = []
    for s in schedules:
        class_info = db.query(Class).filter(Class.id == s.class_id).first()
        subject = db.query(Subject).filter(Subject.id == s.subject_id).first()

        result.append(ExamScheduleResponse(
            id=s.id,
            exam_id=s.exam_id,
            class_id=s.class_id,
            subject_id=s.subject_id,
            exam_date=s.exam_date,
            start_time=s.start_time,
            end_time=s.end_time,
            max_marks=s.max_marks,
            passing_marks=s.passing_marks,
            room=s.room,
            exam_name=exam.name,
            class_name=f"{class_info.name} {class_info.section or ''}".strip() if class_info else None,
            subject_name=subject.name if subject else None,
            created_at=s.created_at
        ))

    return result


@router.post("/exams/{exam_id}/schedules")
async def create_exam_schedule(
    exam_id: int,
    data: ExamScheduleCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Create an exam schedule"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    schedule = ExamSchedule(
        exam_id=exam_id,
        class_id=data.class_id,
        subject_id=data.subject_id,
        exam_date=data.exam_date,
        start_time=data.start_time,
        end_time=data.end_time,
        max_marks=data.max_marks,
        passing_marks=data.passing_marks,
        room=data.room
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    return {"message": "Exam schedule created", "id": schedule.id}


@router.delete("/exams/schedules/{schedule_id}")
async def delete_exam_schedule(
    schedule_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Delete an exam schedule"""
    schedule = db.query(ExamSchedule).filter(ExamSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    db.delete(schedule)
    db.commit()
    return {"message": "Schedule deleted"}


# Exam Results
@router.get("/exams/{exam_id}/results")
async def get_exam_results(
    exam_id: int,
    class_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get exam results with optional filters"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    query = db.query(ExamResult).filter(ExamResult.exam_id == exam_id)

    if class_id:
        student_ids = db.query(Student.id).filter(Student.class_id == class_id).subquery()
        query = query.filter(ExamResult.student_id.in_(student_ids))

    if subject_id:
        query = query.filter(ExamResult.subject_id == subject_id)

    results = query.all()

    response = []
    for r in results:
        student = db.query(Student).filter(Student.id == r.student_id).first()
        subject = db.query(Subject).filter(Subject.id == r.subject_id).first()
        schedule = db.query(ExamSchedule).filter(
            ExamSchedule.exam_id == exam_id,
            ExamSchedule.subject_id == r.subject_id
        ).first()

        response.append(ExamResultResponse(
            id=r.id,
            exam_id=r.exam_id,
            student_id=r.student_id,
            subject_id=r.subject_id,
            marks_obtained=r.marks_obtained,
            grade=r.grade,
            remarks=r.remarks,
            student_name=student.name if student else None,
            subject_name=subject.name if subject else None,
            max_marks=schedule.max_marks if schedule else None,
            created_at=r.created_at
        ))

    return response


@router.post("/exams/results/bulk")
async def add_bulk_results(
    data: ExamResultBulkCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Add results for multiple students at once"""
    exam = db.query(Exam).filter(Exam.id == data.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    for result_data in data.results:
        existing = db.query(ExamResult).filter(
            ExamResult.exam_id == data.exam_id,
            ExamResult.student_id == result_data["student_id"],
            ExamResult.subject_id == data.subject_id
        ).first()

        if existing:
            existing.marks_obtained = result_data["marks_obtained"]
            existing.grade = result_data.get("grade")
            existing.remarks = result_data.get("remarks")
        else:
            new_result = ExamResult(
                exam_id=data.exam_id,
                student_id=result_data["student_id"],
                subject_id=data.subject_id,
                marks_obtained=result_data["marks_obtained"],
                grade=result_data.get("grade"),
                remarks=result_data.get("remarks")
            )
            db.add(new_result)

    db.commit()
    return {"message": f"Results added for {len(data.results)} students"}


# Admin User Management
@router.get("/admins")
async def list_admins(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """List all admin users"""
    admins = db.query(Admin).all()

    result = []
    for admin in admins:
        user = db.query(User).filter(User.id == admin.user_id).first()
        result.append({
            "id": admin.id,
            "user_id": admin.user_id,
            "email": user.email if user else None,
            "name": admin.name,
            "phone": admin.phone,
            "designation": admin.designation,
            "is_active": user.is_active if user else False,
            "created_at": admin.created_at
        })

    return result


@router.post("/admins")
async def create_admin(
    email: str,
    password: str,
    name: str,
    phone: Optional[str] = None,
    designation: Optional[str] = None,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Create a new admin user"""
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=email,
        password_hash=get_password_hash(password),
        role=UserRole.ADMIN
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    admin = Admin(
        user_id=user.id,
        name=name,
        phone=phone,
        designation=designation
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {"message": "Admin created", "id": admin.id}


@router.delete("/admins/{admin_id}")
async def delete_admin(
    admin_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Delete an admin user"""
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    # Prevent self-deletion
    if admin.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    user = db.query(User).filter(User.id == admin.user_id).first()

    db.delete(admin)
    if user:
        db.delete(user)
    db.commit()

    return {"message": "Admin deleted"}
