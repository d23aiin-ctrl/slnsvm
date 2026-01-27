from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from typing import List, Optional
from datetime import date, datetime, timedelta
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models import (
    User, UserRole, Student, Class, Subject, Timetable,
    Assignment, AssignmentSubmission, Attendance, AttendanceStatus,
    Fee, FeeStatus, Notice, Teacher, Exam, ExamSchedule, ExamResult,
    Message, MessageParticipantType
)
from app.schemas import (
    StudentResponse, StudentDashboard, TimetableResponse, TimetableEntry,
    AssignmentResponse, AttendanceResponse, AttendanceSummary
)


class SubmitAssignmentRequest(BaseModel):
    content: Optional[str] = None
    file_url: Optional[str] = None


class SendMessageRequest(BaseModel):
    teacher_id: int
    content: str

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/dashboard")
async def get_student_dashboard(
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Calculate attendance percentage
    total_attendance = db.query(Attendance).filter(Attendance.student_id == student.id).count()
    present_count = db.query(Attendance).filter(
        Attendance.student_id == student.id,
        Attendance.status == AttendanceStatus.PRESENT
    ).count()
    attendance_percentage = (present_count / total_attendance * 100) if total_attendance > 0 else 0

    # Pending assignments
    pending_assignments = db.query(Assignment).filter(
        Assignment.class_id == student.class_id,
        Assignment.due_date >= date.today()
    ).count()

    # Pending fees
    pending_fees = db.query(func.sum(Fee.amount)).filter(
        Fee.student_id == student.id,
        Fee.status.in_([FeeStatus.PENDING, FeeStatus.OVERDUE])
    ).scalar() or 0

    # Recent notices
    notices = db.query(Notice).filter(
        Notice.is_active == True,
        (Notice.target_role == None) | (Notice.target_role == UserRole.STUDENT)
    ).order_by(Notice.created_at.desc()).limit(5).all()

    # Upcoming exams count
    upcoming_exams = db.query(ExamSchedule).filter(
        ExamSchedule.class_id == student.class_id,
        ExamSchedule.exam_date >= date.today()
    ).count()

    return {
        "student": StudentResponse.model_validate(student),
        "attendance_percentage": round(attendance_percentage, 2),
        "pending_assignments": pending_assignments,
        "upcoming_exams": upcoming_exams,
        "fee_pending": float(pending_fees),
        "recent_notices": [{"id": n.id, "title": n.title, "priority": n.priority} for n in notices]
    }


@router.get("/timetable", response_model=TimetableResponse)
async def get_student_timetable(
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    class_info = db.query(Class).filter(Class.id == student.class_id).first()
    if not class_info:
        raise HTTPException(status_code=404, detail="Class not found")

    timetable = db.query(Timetable).filter(Timetable.class_id == student.class_id).all()

    entries = []
    for entry in timetable:
        subject = db.query(Subject).filter(Subject.id == entry.subject_id).first()
        from app.models import Teacher
        teacher = db.query(Teacher).filter(Teacher.id == entry.teacher_id).first()
        entries.append(TimetableEntry(
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
        class_id=class_info.id,
        class_name=f"{class_info.name} - {class_info.section}",
        entries=entries
    )


@router.get("/assignments", response_model=List[AssignmentResponse])
async def get_student_assignments(
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    assignments = db.query(Assignment).filter(
        Assignment.class_id == student.class_id
    ).order_by(Assignment.due_date.desc()).all()

    result = []
    for a in assignments:
        class_info = db.query(Class).filter(Class.id == a.class_id).first()
        subject = db.query(Subject).filter(Subject.id == a.subject_id).first()
        from app.models import Teacher
        teacher = db.query(Teacher).filter(Teacher.id == a.teacher_id).first()
        result.append(AssignmentResponse(
            id=a.id,
            title=a.title,
            description=a.description,
            due_date=a.due_date,
            attachment_url=a.attachment_url,
            max_marks=a.max_marks,
            class_id=a.class_id,
            subject_id=a.subject_id,
            teacher_id=a.teacher_id,
            class_name=f"{class_info.name} - {class_info.section}" if class_info else None,
            subject_name=subject.name if subject else None,
            teacher_name=teacher.name if teacher else None,
            created_at=a.created_at
        ))

    return result


@router.get("/attendance", response_model=AttendanceSummary)
async def get_student_attendance(
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    attendance_records = db.query(Attendance).filter(
        Attendance.student_id == student.id
    ).all()

    total = len(attendance_records)
    present = len([a for a in attendance_records if a.status == AttendanceStatus.PRESENT])
    absent = len([a for a in attendance_records if a.status == AttendanceStatus.ABSENT])
    late = len([a for a in attendance_records if a.status == AttendanceStatus.LATE])
    excused = len([a for a in attendance_records if a.status == AttendanceStatus.EXCUSED])

    percentage = (present / total * 100) if total > 0 else 0

    return AttendanceSummary(
        total_days=total,
        present=present,
        absent=absent,
        late=late,
        excused=excused,
        percentage=round(percentage, 2)
    )


@router.get("/results")
async def get_student_results(
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    from app.models import ExamResult, Exam, Subject
    results = db.query(ExamResult).filter(ExamResult.student_id == student.id).all()

    result_data = []
    for r in results:
        exam = db.query(Exam).filter(Exam.id == r.exam_id).first()
        subject = db.query(Subject).filter(Subject.id == r.subject_id).first()
        result_data.append({
            "id": r.id,
            "exam_name": exam.name if exam else None,
            "subject_name": subject.name if subject else None,
            "marks_obtained": float(r.marks_obtained) if r.marks_obtained else None,
            "grade": r.grade,
            "remarks": r.remarks
        })

    return result_data


@router.get("/notices")
async def get_student_notices(
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """Get notices targeted to students or general notices"""
    notices = db.query(Notice).filter(
        Notice.is_active == True,
        (Notice.target_role == None) | (Notice.target_role == UserRole.STUDENT)
    ).order_by(Notice.created_at.desc()).all()

    return [
        {
            "id": n.id,
            "title": n.title,
            "content": n.content,
            "priority": n.priority,
            "attachment_url": n.attachment_url,
            "created_at": n.created_at,
            "expires_at": n.expires_at
        }
        for n in notices
    ]


# ============ ASSIGNMENT SUBMISSION ============

@router.get("/assignments/with-submissions")
async def get_student_assignments_with_submissions(
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """Get all assignments with submission status"""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    assignments = db.query(Assignment).filter(
        Assignment.class_id == student.class_id
    ).order_by(Assignment.due_date.desc()).all()

    result = []
    for a in assignments:
        class_info = db.query(Class).filter(Class.id == a.class_id).first()
        subject = db.query(Subject).filter(Subject.id == a.subject_id).first()
        teacher = db.query(Teacher).filter(Teacher.id == a.teacher_id).first()

        # Get submission for this student
        submission = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == a.id,
            AssignmentSubmission.student_id == student.id
        ).first()

        # Determine status
        today = date.today()
        if submission:
            if submission.marks_obtained is not None:
                status = "graded"
            else:
                status = "submitted"
        elif a.due_date and a.due_date < today:
            status = "overdue"
        else:
            status = "pending"

        result.append({
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "attachment_url": a.attachment_url,
            "max_marks": a.max_marks,
            "class_name": f"{class_info.name} - {class_info.section}" if class_info else None,
            "subject_name": subject.name if subject else None,
            "teacher_name": teacher.name if teacher else None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "status": status,
            "submission": {
                "id": submission.id,
                "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None,
                "content": submission.content,
                "file_url": submission.file_url,
                "marks_obtained": float(submission.marks_obtained) if submission.marks_obtained else None,
                "feedback": submission.feedback
            } if submission else None
        })

    return result


@router.post("/assignments/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: int,
    request: SubmitAssignmentRequest,
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """Submit an assignment"""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Check if assignment exists and is for this student's class
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.class_id == student.class_id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check if already submitted
    existing = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.student_id == student.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Assignment already submitted")

    # Check if past due date
    if assignment.due_date and assignment.due_date < date.today():
        raise HTTPException(status_code=400, detail="Cannot submit after due date")

    # Validate that either content or file is provided
    if not request.content and not request.file_url:
        raise HTTPException(status_code=400, detail="Please provide content or file")

    # Create submission
    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        student_id=student.id,
        content=request.content,
        file_url=request.file_url,
        submitted_at=datetime.now()
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "message": "Assignment submitted successfully",
        "submission_id": submission.id
    }


# ============ FEES ============

@router.get("/fees")
async def get_student_fees(
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """Get student's fee details"""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    fees = db.query(Fee).filter(Fee.student_id == student.id).order_by(Fee.due_date.desc()).all()

    # Calculate summary
    total_amount = sum(float(f.amount) for f in fees)
    paid_amount = sum(float(f.paid_amount or 0) for f in fees)
    pending_amount = sum(
        float(f.amount) - float(f.paid_amount or 0)
        for f in fees if f.status in [FeeStatus.PENDING, FeeStatus.OVERDUE, FeeStatus.PARTIAL]
    )

    return {
        "summary": {
            "total_amount": total_amount,
            "paid_amount": paid_amount,
            "pending_amount": pending_amount
        },
        "fees": [
            {
                "id": f.id,
                "fee_type": f.fee_type.value if f.fee_type else None,
                "amount": float(f.amount),
                "paid_amount": float(f.paid_amount or 0),
                "due_date": f.due_date.isoformat() if f.due_date else None,
                "status": f.status.value if f.status else None,
                "description": f.description,
                "academic_year": f.academic_year
            }
            for f in fees
        ]
    }


# ============ EXAM SCHEDULE ============

@router.get("/exam-schedule")
async def get_student_exam_schedule(
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """Get upcoming exam schedule for the student"""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Get upcoming exams (schedules for this class with future dates)
    schedules = db.query(ExamSchedule).filter(
        ExamSchedule.class_id == student.class_id,
        ExamSchedule.exam_date >= date.today()
    ).order_by(ExamSchedule.exam_date, ExamSchedule.start_time).all()

    # Group by exam
    exams_data = {}
    for schedule in schedules:
        exam = db.query(Exam).filter(Exam.id == schedule.exam_id).first()
        subject = db.query(Subject).filter(Subject.id == schedule.subject_id).first()

        if exam:
            if exam.id not in exams_data:
                exams_data[exam.id] = {
                    "exam_id": exam.id,
                    "exam_name": exam.name,
                    "academic_year": exam.academic_year,
                    "schedules": []
                }

            exams_data[exam.id]["schedules"].append({
                "id": schedule.id,
                "subject_name": subject.name if subject else None,
                "exam_date": schedule.exam_date.isoformat() if schedule.exam_date else None,
                "start_time": schedule.start_time.strftime("%H:%M") if schedule.start_time else None,
                "end_time": schedule.end_time.strftime("%H:%M") if schedule.end_time else None,
                "room": schedule.room,
                "max_marks": schedule.max_marks
            })

    return list(exams_data.values())


# ============ PROFILE ============

@router.get("/profile")
async def get_student_profile(
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """Get student profile details"""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    class_info = db.query(Class).filter(Class.id == student.class_id).first()

    return {
        "id": student.id,
        "name": student.name,
        "email": current_user.email,
        "phone": student.phone,
        "admission_no": student.admission_no,
        "roll_no": student.roll_no,
        "date_of_birth": student.date_of_birth.isoformat() if student.date_of_birth else None,
        "gender": student.gender,
        "blood_group": student.blood_group,
        "address": student.address,
        "class_name": class_info.name if class_info else None,
        "section": student.section,
        "academic_year": student.academic_year,
        "admission_date": student.admission_date.isoformat() if student.admission_date else None
    }


# ============ MESSAGING ============

@router.get("/messages/teachers")
async def get_teachers_for_messaging(
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """Get list of teachers the student can message (teachers of their class)"""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Get teachers who teach this student's class
    from app.models.academic import teacher_classes
    teacher_ids = db.query(teacher_classes.c.teacher_id).filter(
        teacher_classes.c.class_id == student.class_id
    ).all()

    teachers = db.query(Teacher).filter(
        Teacher.id.in_([t[0] for t in teacher_ids])
    ).all()

    result = []
    for teacher in teachers:
        # Get unread message count
        unread_count = db.query(Message).filter(
            Message.sender_id == teacher.id,
            Message.sender_type == MessageParticipantType.TEACHER,
            Message.receiver_id == student.id,
            Message.receiver_type == MessageParticipantType.STUDENT,
            Message.is_read == False
        ).count()

        # Get last message
        last_message = db.query(Message).filter(
            or_(
                and_(
                    Message.sender_id == teacher.id,
                    Message.sender_type == MessageParticipantType.TEACHER,
                    Message.receiver_id == student.id,
                    Message.receiver_type == MessageParticipantType.STUDENT
                ),
                and_(
                    Message.sender_id == student.id,
                    Message.sender_type == MessageParticipantType.STUDENT,
                    Message.receiver_id == teacher.id,
                    Message.receiver_type == MessageParticipantType.TEACHER
                )
            )
        ).order_by(Message.created_at.desc()).first()

        result.append({
            "id": teacher.id,
            "name": teacher.name,
            "email": teacher.user.email if teacher.user else None,
            "unread_count": unread_count,
            "last_message": {
                "content": last_message.content[:50] + "..." if last_message and len(last_message.content) > 50 else (last_message.content if last_message else None),
                "created_at": last_message.created_at.isoformat() if last_message else None,
                "is_from_me": last_message.sender_type == MessageParticipantType.STUDENT if last_message else False
            } if last_message else None
        })

    return result


@router.get("/messages/teacher/{teacher_id}")
async def get_conversation_with_teacher(
    teacher_id: int,
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """Get conversation with a specific teacher"""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Get all messages between student and teacher
    messages = db.query(Message).filter(
        or_(
            and_(
                Message.sender_id == teacher.id,
                Message.sender_type == MessageParticipantType.TEACHER,
                Message.receiver_id == student.id,
                Message.receiver_type == MessageParticipantType.STUDENT
            ),
            and_(
                Message.sender_id == student.id,
                Message.sender_type == MessageParticipantType.STUDENT,
                Message.receiver_id == teacher.id,
                Message.receiver_type == MessageParticipantType.TEACHER
            )
        )
    ).order_by(Message.created_at.asc()).all()

    # Mark received messages as read
    for msg in messages:
        if msg.receiver_type == MessageParticipantType.STUDENT and msg.receiver_id == student.id and not msg.is_read:
            msg.is_read = True
            msg.read_at = datetime.now()
    db.commit()

    return {
        "teacher": {
            "id": teacher.id,
            "name": teacher.name
        },
        "messages": [
            {
                "id": m.id,
                "content": m.content,
                "created_at": m.created_at.isoformat() if m.created_at else None,
                "is_from_me": m.sender_type == MessageParticipantType.STUDENT,
                "is_read": m.is_read
            }
            for m in messages
        ]
    }


@router.post("/messages/send")
async def send_message_to_teacher(
    request: SendMessageRequest,
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """Send a message to a teacher"""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    teacher = db.query(Teacher).filter(Teacher.id == request.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    message = Message(
        sender_id=student.id,
        sender_type=MessageParticipantType.STUDENT,
        receiver_id=teacher.id,
        receiver_type=MessageParticipantType.TEACHER,
        content=request.content,
        student_id=student.id,
        is_read=False,
        created_at=datetime.now()
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return {
        "message": "Message sent successfully",
        "id": message.id
    }


@router.put("/messages/{message_id}/read")
async def mark_message_as_read(
    message_id: int,
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """Mark a message as read"""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    message = db.query(Message).filter(
        Message.id == message_id,
        Message.receiver_id == student.id,
        Message.receiver_type == MessageParticipantType.STUDENT
    ).first()

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    message.is_read = True
    message.read_at = datetime.now()
    db.commit()

    return {"message": "Message marked as read"}
