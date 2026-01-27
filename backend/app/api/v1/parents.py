from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from typing import List
from datetime import date, datetime
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models import (
    User, UserRole, Parent, Student, Class, Attendance, AttendanceStatus,
    Fee, FeeStatus, Notice, Teacher, Subject, Message, MessageParticipantType,
    Exam, ExamSchedule, ExamResult, Assignment, AssignmentSubmission, Timetable, DayOfWeek
)
from app.schemas import (
    ParentResponse, ParentDashboard, ChildInfo, FeeResponse, FeeSummary,
    ConversationTeacher, MessageResponse, SendMessageRequest
)

router = APIRouter(prefix="/parents", tags=["Parents"])


@router.get("/dashboard")
async def get_parent_dashboard(
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    children = db.query(Student).filter(Student.parent_id == parent.id).all()

    children_info = []
    total_pending = 0

    for child in children:
        class_info = db.query(Class).filter(Class.id == child.class_id).first()

        # Attendance
        total_attendance = db.query(Attendance).filter(Attendance.student_id == child.id).count()
        present_count = db.query(Attendance).filter(
            Attendance.student_id == child.id,
            Attendance.status == AttendanceStatus.PRESENT
        ).count()
        attendance_pct = (present_count / total_attendance * 100) if total_attendance > 0 else 0

        # Fees
        pending = db.query(func.sum(Fee.amount)).filter(
            Fee.student_id == child.id,
            Fee.status.in_([FeeStatus.PENDING, FeeStatus.OVERDUE])
        ).scalar() or 0
        total_pending += float(pending)

        fee_status = "paid" if pending == 0 else "pending"

        children_info.append(ChildInfo(
            id=child.id,
            name=child.name,
            admission_no=child.admission_no,
            class_name=class_info.name if class_info else None,
            section=child.section,
            roll_no=child.roll_no,
            attendance_percentage=round(attendance_pct, 2),
            fee_status=fee_status
        ))

    # Notices
    notices = db.query(Notice).filter(
        Notice.is_active == True,
        (Notice.target_role == None) | (Notice.target_role == UserRole.PARENT)
    ).order_by(Notice.created_at.desc()).limit(5).all()

    return {
        "parent": ParentResponse.model_validate(parent),
        "children": children_info,
        "total_fee_pending": total_pending,
        "recent_notices": [{"id": n.id, "title": n.title, "priority": n.priority} for n in notices]
    }


@router.get("/children", response_model=List[ChildInfo])
async def get_children(
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    children = db.query(Student).filter(Student.parent_id == parent.id).all()

    children_info = []
    for child in children:
        class_info = db.query(Class).filter(Class.id == child.class_id).first()

        total_attendance = db.query(Attendance).filter(Attendance.student_id == child.id).count()
        present_count = db.query(Attendance).filter(
            Attendance.student_id == child.id,
            Attendance.status == AttendanceStatus.PRESENT
        ).count()
        attendance_pct = (present_count / total_attendance * 100) if total_attendance > 0 else 0

        pending = db.query(func.sum(Fee.amount)).filter(
            Fee.student_id == child.id,
            Fee.status.in_([FeeStatus.PENDING, FeeStatus.OVERDUE])
        ).scalar() or 0

        children_info.append(ChildInfo(
            id=child.id,
            name=child.name,
            admission_no=child.admission_no,
            class_name=class_info.name if class_info else None,
            section=child.section,
            roll_no=child.roll_no,
            attendance_percentage=round(attendance_pct, 2),
            fee_status="paid" if pending == 0 else "pending"
        ))

    return children_info


@router.get("/fees", response_model=FeeSummary)
async def get_fees(
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    children = db.query(Student).filter(Student.parent_id == parent.id).all()
    child_ids = [c.id for c in children]

    fees = db.query(Fee).filter(Fee.student_id.in_(child_ids)).all()

    total_fees = sum(float(f.amount) for f in fees)
    total_paid = sum(float(f.paid_amount or 0) for f in fees if f.status == FeeStatus.PAID)
    total_pending = sum(float(f.amount) for f in fees if f.status in [FeeStatus.PENDING, FeeStatus.PARTIAL])
    overdue = sum(float(f.amount) for f in fees if f.status == FeeStatus.OVERDUE)

    fee_responses = []
    for f in fees:
        student = db.query(Student).filter(Student.id == f.student_id).first()
        fee_responses.append(FeeResponse(
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

    return FeeSummary(
        total_fees=total_fees,
        total_paid=total_paid,
        total_pending=total_pending,
        overdue_amount=overdue,
        fees=fee_responses
    )


@router.post("/fees/pay")
async def pay_fee(
    fee_id: int,
    amount: float,
    payment_method: str,
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    fee = db.query(Fee).filter(Fee.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee not found")

    # Verify the fee belongs to parent's child
    student = db.query(Student).filter(Student.id == fee.student_id).first()
    if not student or student.parent_id != parent.id:
        raise HTTPException(status_code=403, detail="Not authorized to pay this fee")

    fee.paid_amount = amount
    fee.paid_date = date.today()
    fee.payment_method = payment_method
    fee.status = FeeStatus.PAID if amount >= float(fee.amount) else FeeStatus.PARTIAL
    fee.receipt_number = f"RCP-{fee.id}-{date.today().strftime('%Y%m%d')}"

    db.commit()
    db.refresh(fee)

    return {"message": "Payment successful", "receipt_number": fee.receipt_number}


@router.get("/attendance")
async def get_children_attendance(
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    """Get attendance records for all children of the parent"""
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    children = db.query(Student).filter(Student.parent_id == parent.id).all()

    result = []
    for child in children:
        class_info = db.query(Class).filter(Class.id == child.class_id).first()

        # Get attendance records
        attendance_records = db.query(Attendance).filter(
            Attendance.student_id == child.id
        ).order_by(Attendance.date.desc()).limit(30).all()

        # Calculate summary
        total = len(attendance_records)
        present = len([a for a in attendance_records if a.status == AttendanceStatus.PRESENT])
        absent = len([a for a in attendance_records if a.status == AttendanceStatus.ABSENT])
        late = len([a for a in attendance_records if a.status == AttendanceStatus.LATE])

        percentage = (present / total * 100) if total > 0 else 0

        result.append({
            "student_id": child.id,
            "student_name": child.name,
            "class_name": class_info.name if class_info else None,
            "section": child.section,
            "summary": {
                "total_days": total,
                "present": present,
                "absent": absent,
                "late": late,
                "percentage": round(percentage, 2)
            },
            "recent_records": [
                {
                    "date": a.date.isoformat(),
                    "status": a.status.value,
                    "remarks": a.remarks
                }
                for a in attendance_records
            ]
        })

    return result


@router.get("/notices")
async def get_parent_notices(
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    """Get notices targeted to parents or general notices"""
    notices = db.query(Notice).filter(
        Notice.is_active == True,
        (Notice.target_role == None) | (Notice.target_role == UserRole.PARENT)
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


# ============ MESSAGES ============

@router.get("/messages/teachers", response_model=List[ConversationTeacher])
async def get_teachers_for_messaging(
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    """Get list of teachers the parent can message (teachers of their children)"""
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    # Get all children
    children = db.query(Student).filter(Student.parent_id == parent.id).all()
    child_class_ids = [c.class_id for c in children]

    # Get subjects for those classes
    subjects = db.query(Subject).filter(Subject.class_id.in_(child_class_ids)).all()

    # Get unique teachers from those subjects
    teacher_ids = set()
    teacher_subject_map = {}
    for subject in subjects:
        for teacher in subject.teachers:
            teacher_ids.add(teacher.id)
            if teacher.id not in teacher_subject_map:
                teacher_subject_map[teacher.id] = []
            teacher_subject_map[teacher.id].append(subject.name)

    teachers = db.query(Teacher).filter(Teacher.id.in_(teacher_ids)).all()

    result = []
    for teacher in teachers:
        # Get last message and unread count
        last_msg = db.query(Message).filter(
            or_(
                and_(
                    Message.sender_id == parent.id,
                    Message.sender_type == MessageParticipantType.PARENT,
                    Message.receiver_id == teacher.id,
                    Message.receiver_type == MessageParticipantType.TEACHER
                ),
                and_(
                    Message.sender_id == teacher.id,
                    Message.sender_type == MessageParticipantType.TEACHER,
                    Message.receiver_id == parent.id,
                    Message.receiver_type == MessageParticipantType.PARENT
                )
            )
        ).order_by(Message.created_at.desc()).first()

        unread_count = db.query(Message).filter(
            Message.sender_id == teacher.id,
            Message.sender_type == MessageParticipantType.TEACHER,
            Message.receiver_id == parent.id,
            Message.receiver_type == MessageParticipantType.PARENT,
            Message.is_read == False
        ).count()

        subjects_str = ", ".join(teacher_subject_map.get(teacher.id, []))

        result.append(ConversationTeacher(
            id=teacher.id,
            name=teacher.name,
            subject=subjects_str,
            last_message=last_msg.content[:50] + "..." if last_msg and len(last_msg.content) > 50 else (last_msg.content if last_msg else None),
            last_message_time=last_msg.created_at if last_msg else None,
            unread_count=unread_count
        ))

    # Sort by last message time (most recent first)
    result.sort(key=lambda x: x.last_message_time or datetime.min, reverse=True)

    return result


@router.get("/messages/teacher/{teacher_id}", response_model=List[MessageResponse])
async def get_conversation_with_teacher(
    teacher_id: int,
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    """Get all messages between the parent and a specific teacher"""
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    messages = db.query(Message).filter(
        or_(
            and_(
                Message.sender_id == parent.id,
                Message.sender_type == MessageParticipantType.PARENT,
                Message.receiver_id == teacher.id,
                Message.receiver_type == MessageParticipantType.TEACHER
            ),
            and_(
                Message.sender_id == teacher.id,
                Message.sender_type == MessageParticipantType.TEACHER,
                Message.receiver_id == parent.id,
                Message.receiver_type == MessageParticipantType.PARENT
            )
        )
    ).order_by(Message.created_at.asc()).all()

    # Mark unread messages from teacher as read
    db.query(Message).filter(
        Message.sender_id == teacher.id,
        Message.sender_type == MessageParticipantType.TEACHER,
        Message.receiver_id == parent.id,
        Message.receiver_type == MessageParticipantType.PARENT,
        Message.is_read == False
    ).update({"is_read": True, "read_at": datetime.now()})
    db.commit()

    return messages


@router.post("/messages/send", response_model=MessageResponse)
async def send_message_to_teacher(
    request: SendMessageRequest,
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    """Send a message to a teacher"""
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    teacher = db.query(Teacher).filter(Teacher.id == request.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Create the message
    message = Message(
        sender_id=parent.id,
        sender_type=MessageParticipantType.PARENT,
        receiver_id=teacher.id,
        receiver_type=MessageParticipantType.TEACHER,
        content=request.content,
        student_id=request.student_id,
        is_read=False
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


@router.put("/messages/{message_id}/read")
async def mark_message_as_read(
    message_id: int,
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    """Mark a message as read"""
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    message = db.query(Message).filter(
        Message.id == message_id,
        Message.receiver_id == parent.id,
        Message.receiver_type == MessageParticipantType.PARENT
    ).first()

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    message.is_read = True
    message.read_at = datetime.now()
    db.commit()

    return {"message": "Message marked as read"}


# ============ EXAM RESULTS ============

@router.get("/results")
async def get_children_exam_results(
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    """Get exam results for all children"""
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    children = db.query(Student).filter(Student.parent_id == parent.id).all()

    result = []
    for child in children:
        class_info = db.query(Class).filter(Class.id == child.class_id).first()

        # Get all exam results for this student
        exam_results = db.query(ExamResult).filter(
            ExamResult.student_id == child.id
        ).all()

        # Group results by exam
        exams_data = {}
        for er in exam_results:
            exam = db.query(Exam).filter(Exam.id == er.exam_id).first()
            subject = db.query(Subject).filter(Subject.id == er.subject_id).first()

            # Get max marks from schedule
            schedule = db.query(ExamSchedule).filter(
                ExamSchedule.exam_id == er.exam_id,
                ExamSchedule.subject_id == er.subject_id,
                ExamSchedule.class_id == child.class_id
            ).first()

            if exam:
                if exam.id not in exams_data:
                    exams_data[exam.id] = {
                        "exam_id": exam.id,
                        "exam_name": exam.name,
                        "academic_year": exam.academic_year,
                        "subjects": [],
                        "total_marks": 0,
                        "obtained_marks": 0
                    }

                max_marks = schedule.max_marks if schedule else 100
                exams_data[exam.id]["subjects"].append({
                    "subject_name": subject.name if subject else "Unknown",
                    "marks_obtained": float(er.marks_obtained) if er.marks_obtained else 0,
                    "max_marks": max_marks,
                    "grade": er.grade,
                    "remarks": er.remarks
                })
                exams_data[exam.id]["total_marks"] += max_marks
                exams_data[exam.id]["obtained_marks"] += float(er.marks_obtained) if er.marks_obtained else 0

        # Calculate percentage for each exam
        for exam_id in exams_data:
            total = exams_data[exam_id]["total_marks"]
            obtained = exams_data[exam_id]["obtained_marks"]
            exams_data[exam_id]["percentage"] = round((obtained / total * 100) if total > 0 else 0, 2)

        result.append({
            "student_id": child.id,
            "student_name": child.name,
            "class_name": class_info.name if class_info else None,
            "section": child.section,
            "roll_no": child.roll_no,
            "exams": list(exams_data.values())
        })

    return result


# ============ ASSIGNMENTS ============

@router.get("/assignments")
async def get_children_assignments(
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    """Get assignments for all children"""
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    children = db.query(Student).filter(Student.parent_id == parent.id).all()

    result = []
    for child in children:
        class_info = db.query(Class).filter(Class.id == child.class_id).first()

        # Get all assignments for this child's class
        assignments = db.query(Assignment).filter(
            Assignment.class_id == child.class_id
        ).order_by(Assignment.due_date.desc()).all()

        assignments_data = []
        for assignment in assignments:
            subject = db.query(Subject).filter(Subject.id == assignment.subject_id).first()
            teacher = db.query(Teacher).filter(Teacher.id == assignment.teacher_id).first()

            # Check if child has submitted
            submission = db.query(AssignmentSubmission).filter(
                AssignmentSubmission.assignment_id == assignment.id,
                AssignmentSubmission.student_id == child.id
            ).first()

            # Determine status
            today = date.today()
            if submission:
                if submission.marks_obtained is not None:
                    status = "graded"
                else:
                    status = "submitted"
            elif assignment.due_date and assignment.due_date < today:
                status = "overdue"
            else:
                status = "pending"

            assignments_data.append({
                "id": assignment.id,
                "title": assignment.title,
                "description": assignment.description,
                "subject_name": subject.name if subject else None,
                "teacher_name": teacher.name if teacher else None,
                "due_date": assignment.due_date.isoformat() if assignment.due_date else None,
                "max_marks": assignment.max_marks,
                "status": status,
                "submission": {
                    "submitted_at": submission.submitted_at.isoformat() if submission and submission.submitted_at else None,
                    "marks_obtained": float(submission.marks_obtained) if submission and submission.marks_obtained else None,
                    "feedback": submission.feedback if submission else None
                } if submission else None
            })

        result.append({
            "student_id": child.id,
            "student_name": child.name,
            "class_name": class_info.name if class_info else None,
            "section": child.section,
            "assignments": assignments_data
        })

    return result


# ============ TIMETABLE ============

@router.get("/timetable")
async def get_children_timetable(
    current_user: User = Depends(require_role([UserRole.PARENT])),
    db: Session = Depends(get_db)
):
    """Get timetable for all children"""
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    children = db.query(Student).filter(Student.parent_id == parent.id).all()

    result = []
    for child in children:
        class_info = db.query(Class).filter(Class.id == child.class_id).first()

        # Get timetable entries for this child's class
        entries = db.query(Timetable).filter(
            Timetable.class_id == child.class_id
        ).order_by(Timetable.day, Timetable.period).all()

        # Group by day
        timetable_by_day = {}
        for entry in entries:
            subject = db.query(Subject).filter(Subject.id == entry.subject_id).first()
            teacher = db.query(Teacher).filter(Teacher.id == entry.teacher_id).first()

            day_name = entry.day.value if entry.day else "unknown"
            if day_name not in timetable_by_day:
                timetable_by_day[day_name] = []

            timetable_by_day[day_name].append({
                "period": entry.period,
                "start_time": entry.start_time.strftime("%H:%M") if entry.start_time else None,
                "end_time": entry.end_time.strftime("%H:%M") if entry.end_time else None,
                "subject_name": subject.name if subject else None,
                "teacher_name": teacher.name if teacher else None,
                "room": entry.room
            })

        result.append({
            "student_id": child.id,
            "student_name": child.name,
            "class_name": class_info.name if class_info else None,
            "section": child.section,
            "timetable": timetable_by_day
        })

    return result
