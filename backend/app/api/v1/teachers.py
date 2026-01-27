from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from datetime import date, datetime
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models import (
    User, UserRole, Teacher, Class, Student, Subject, Timetable, DayOfWeek,
    Assignment, AssignmentSubmission, Attendance, AttendanceStatus, Notice,
    Parent, Message, MessageParticipantType
)
from app.schemas import (
    TeacherResponse, TeacherDashboard, ClassInfo,
    AssignmentCreate, AssignmentResponse, AssignmentUpdate,
    AttendanceBulkCreate, ClassAttendanceResponse, StudentAttendanceRecord,
    TeacherMarksEntry, ConversationParent, MessageResponse
)

router = APIRouter(prefix="/teachers", tags=["Teachers"])


@router.get("/dashboard")
async def get_teacher_dashboard(
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    classes = teacher.classes
    class_info_list = []
    total_students = 0

    for c in classes:
        students_count = db.query(Student).filter(Student.class_id == c.id).count()
        total_students += students_count
        class_info_list.append(ClassInfo(
            id=c.id,
            name=c.name,
            section=c.section,
            total_students=students_count
        ))

    # Pending assignments to grade
    pending_submissions = db.query(AssignmentSubmission).join(Assignment).filter(
        Assignment.teacher_id == teacher.id,
        AssignmentSubmission.marks_obtained == None
    ).count()

    # Today's schedule
    day_map = {
        0: DayOfWeek.MONDAY, 1: DayOfWeek.TUESDAY, 2: DayOfWeek.WEDNESDAY,
        3: DayOfWeek.THURSDAY, 4: DayOfWeek.FRIDAY, 5: DayOfWeek.SATURDAY
    }
    today_day = day_map.get(date.today().weekday())
    today_schedule = []
    if today_day:
        schedule = db.query(Timetable).filter(
            Timetable.teacher_id == teacher.id,
            Timetable.day == today_day
        ).order_by(Timetable.period).all()
        for s in schedule:
            class_info = db.query(Class).filter(Class.id == s.class_id).first()
            subject = db.query(Subject).filter(Subject.id == s.subject_id).first()
            today_schedule.append({
                "period": s.period,
                "class": f"{class_info.name} - {class_info.section}" if class_info else None,
                "subject": subject.name if subject else None,
                "room": s.room
            })

    # Notices
    notices = db.query(Notice).filter(
        Notice.is_active == True,
        (Notice.target_role == None) | (Notice.target_role == UserRole.TEACHER)
    ).order_by(Notice.created_at.desc()).limit(5).all()

    return {
        "teacher": TeacherResponse.model_validate(teacher),
        "classes": class_info_list,
        "total_students": total_students,
        "pending_assignments_to_grade": pending_submissions,
        "today_schedule": today_schedule,
        "recent_notices": [{"id": n.id, "title": n.title, "priority": n.priority} for n in notices]
    }


@router.get("/classes")
async def get_teacher_classes(
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Get all classes assigned to the teacher with subjects they teach"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    result = []
    for c in teacher.classes:
        students_count = db.query(Student).filter(Student.class_id == c.id).count()

        # Get subjects the teacher teaches in this class
        subject_names = []
        for subject in teacher.subjects:
            # Check if subject belongs to this class
            if subject.class_id == c.id:
                subject_names.append(subject.name)

        # If no specific class subjects, show all teacher's subjects
        if not subject_names:
            subject_names = [s.name for s in teacher.subjects]

        result.append({
            "id": c.id,
            "name": c.name,
            "section": c.section,
            "academic_year": c.academic_year,
            "room_number": c.room_number,
            "student_count": students_count,
            "subjects": subject_names
        })

    return result


@router.get("/assignments")
async def get_teacher_assignments(
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Get all assignments created by the teacher"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    assignments = db.query(Assignment).filter(
        Assignment.teacher_id == teacher.id
    ).order_by(Assignment.created_at.desc()).all()

    result = []
    for a in assignments:
        class_info = db.query(Class).filter(Class.id == a.class_id).first()
        subject = db.query(Subject).filter(Subject.id == a.subject_id).first()

        # Count submissions
        submission_count = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == a.id
        ).count()

        # Total students in class
        total_students = db.query(Student).filter(Student.class_id == a.class_id).count()

        result.append({
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "class_name": class_info.name if class_info else None,
            "section": class_info.section if class_info else None,
            "subject_name": subject.name if subject else None,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "submission_count": submission_count,
            "total_students": total_students
        })

    return result


@router.delete("/assignments/{assignment_id}")
async def delete_assignment(
    assignment_id: int,
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Delete an assignment"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.teacher_id == teacher.id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted successfully"}


@router.post("/assignments", response_model=AssignmentResponse)
async def create_assignment(
    assignment_data: AssignmentCreate,
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    assignment = Assignment(
        title=assignment_data.title,
        description=assignment_data.description,
        class_id=assignment_data.class_id,
        subject_id=assignment_data.subject_id,
        teacher_id=teacher.id,
        due_date=assignment_data.due_date,
        attachment_url=assignment_data.attachment_url,
        max_marks=assignment_data.max_marks
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    class_info = db.query(Class).filter(Class.id == assignment.class_id).first()
    subject = db.query(Subject).filter(Subject.id == assignment.subject_id).first()

    return AssignmentResponse(
        id=assignment.id,
        title=assignment.title,
        description=assignment.description,
        due_date=assignment.due_date,
        attachment_url=assignment.attachment_url,
        max_marks=assignment.max_marks,
        class_id=assignment.class_id,
        subject_id=assignment.subject_id,
        teacher_id=assignment.teacher_id,
        class_name=f"{class_info.name} - {class_info.section}" if class_info else None,
        subject_name=subject.name if subject else None,
        teacher_name=teacher.name,
        created_at=assignment.created_at
    )


@router.post("/attendance")
async def mark_attendance(
    attendance_data: AttendanceBulkCreate,
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    for record in attendance_data.records:
        existing = db.query(Attendance).filter(
            Attendance.student_id == record["student_id"],
            Attendance.date == attendance_data.date
        ).first()

        if existing:
            existing.status = AttendanceStatus(record["status"])
            existing.remarks = record.get("remarks")
        else:
            attendance = Attendance(
                student_id=record["student_id"],
                date=attendance_data.date,
                status=AttendanceStatus(record["status"]),
                marked_by=teacher.id,
                remarks=record.get("remarks")
            )
            db.add(attendance)

    db.commit()
    return {"message": "Attendance marked successfully"}


@router.get("/attendance/{class_id}/{date}", response_model=ClassAttendanceResponse)
async def get_class_attendance(
    class_id: int,
    date: date,
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    class_info = db.query(Class).filter(Class.id == class_id).first()
    if not class_info:
        raise HTTPException(status_code=404, detail="Class not found")

    students = db.query(Student).filter(Student.class_id == class_id).all()

    records = []
    present = absent = late = 0

    for student in students:
        attendance = db.query(Attendance).filter(
            Attendance.student_id == student.id,
            Attendance.date == date
        ).first()

        status = attendance.status if attendance else AttendanceStatus.ABSENT
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
            status=status,
            remarks=attendance.remarks if attendance else None
        ))

    return ClassAttendanceResponse(
        date=date,
        class_id=class_id,
        class_name=f"{class_info.name} - {class_info.section}",
        total_students=len(students),
        present=present,
        absent=absent,
        late=late,
        records=records
    )


@router.get("/exams")
async def get_teacher_exams(
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Get all exams for classes that the teacher teaches"""
    from app.models import Exam, ExamSchedule

    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    # Get classes and subjects the teacher teaches
    class_ids = [c.id for c in teacher.classes]
    subject_ids = [s.id for s in teacher.subjects]

    if not class_ids or not subject_ids:
        return []

    # Get exam schedules for teacher's classes and subjects
    schedules = db.query(ExamSchedule).filter(
        ExamSchedule.class_id.in_(class_ids),
        ExamSchedule.subject_id.in_(subject_ids)
    ).all()

    result = []
    for schedule in schedules:
        exam = db.query(Exam).filter(Exam.id == schedule.exam_id).first()
        class_info = db.query(Class).filter(Class.id == schedule.class_id).first()
        subject = db.query(Subject).filter(Subject.id == schedule.subject_id).first()

        result.append({
            "id": schedule.exam_id,
            "name": exam.name if exam else "Exam",
            "class_id": schedule.class_id,
            "class_name": f"{class_info.name} - {class_info.section}" if class_info else None,
            "subject_id": schedule.subject_id,
            "subject_name": subject.name if subject else None,
            "max_marks": schedule.max_marks,
            "date": schedule.exam_date.isoformat() if schedule.exam_date else None
        })

    return result


@router.get("/exam/{exam_id}/students")
async def get_exam_students(
    exam_id: int,
    class_id: int = None,
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Get students and existing marks for an exam"""
    from app.models import Exam, ExamResult, ExamSchedule

    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Get class_id from ExamSchedule if not provided
    if not class_id:
        schedule = db.query(ExamSchedule).filter(ExamSchedule.exam_id == exam_id).first()
        if schedule:
            class_id = schedule.class_id

    if not class_id:
        return {"students": [], "marks": []}

    # Get students in the class
    students = db.query(Student).filter(Student.class_id == class_id).order_by(Student.roll_no).all()

    # Get existing marks
    marks = db.query(ExamResult).filter(ExamResult.exam_id == exam_id).all()

    return {
        "students": [
            {
                "id": s.id,
                "name": s.name,
                "roll_no": s.roll_no,
                "admission_no": s.admission_no
            }
            for s in students
        ],
        "marks": [
            {
                "student_id": m.student_id,
                "subject_id": m.subject_id,
                "marks_obtained": float(m.marks_obtained) if m.marks_obtained else None
            }
            for m in marks
        ]
    }


@router.post("/marks")
async def enter_marks(
    data: TeacherMarksEntry,
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Enter marks for students with proper validation"""
    from app.models import ExamResult, Exam, ExamSchedule

    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    # Verify exam exists
    exam = db.query(Exam).filter(Exam.id == data.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Get max marks from schedule for validation
    schedule = db.query(ExamSchedule).filter(
        ExamSchedule.exam_id == data.exam_id,
        ExamSchedule.subject_id == data.subject_id
    ).first()

    max_marks = schedule.max_marks if schedule else None

    for result in data.results:
        # Validate marks against max_marks if available
        if max_marks and result.marks_obtained > max_marks:
            raise HTTPException(
                status_code=400,
                detail=f"Marks ({result.marks_obtained}) cannot exceed max marks ({max_marks}) for student {result.student_id}"
            )

        if result.marks_obtained < 0:
            raise HTTPException(
                status_code=400,
                detail=f"Marks cannot be negative for student {result.student_id}"
            )

        existing = db.query(ExamResult).filter(
            ExamResult.exam_id == data.exam_id,
            ExamResult.student_id == result.student_id,
            ExamResult.subject_id == data.subject_id
        ).first()

        if existing:
            existing.marks_obtained = result.marks_obtained
            existing.grade = result.grade
            existing.remarks = result.remarks
        else:
            exam_result = ExamResult(
                exam_id=data.exam_id,
                student_id=result.student_id,
                subject_id=data.subject_id,
                marks_obtained=result.marks_obtained,
                grade=result.grade,
                remarks=result.remarks,
                entered_by=teacher.id
            )
            db.add(exam_result)

    db.commit()
    return {"message": f"Marks entered successfully for {len(data.results)} students"}


# Teacher Profile
@router.get("/profile")
async def get_teacher_profile(
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Get current teacher's profile"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    return {
        "id": teacher.id,
        "user_id": teacher.user_id,
        "email": current_user.email,
        "employee_id": teacher.employee_id,
        "name": teacher.name,
        "phone": teacher.phone,
        "qualification": teacher.qualification,
        "experience_years": teacher.experience_years,
        "join_date": teacher.join_date.isoformat() if teacher.join_date else None,
        "address": teacher.address,
        "profile_image": teacher.profile_image,
        "classes": [{"id": c.id, "name": c.name, "section": c.section} for c in teacher.classes],
        "subjects": [{"id": s.id, "name": s.name, "code": s.code} for s in teacher.subjects]
    }


@router.put("/profile")
async def update_teacher_profile(
    phone: str = None,
    address: str = None,
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Update teacher's own profile (limited fields)"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    if phone is not None:
        teacher.phone = phone
    if address is not None:
        teacher.address = address

    db.commit()
    db.refresh(teacher)
    return {"message": "Profile updated successfully"}


# Teacher Timetable
@router.get("/timetable")
async def get_teacher_timetable(
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Get teacher's complete weekly timetable"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    entries = db.query(Timetable).filter(Timetable.teacher_id == teacher.id).all()

    result = []
    for entry in entries:
        class_info = db.query(Class).filter(Class.id == entry.class_id).first()
        subject = db.query(Subject).filter(Subject.id == entry.subject_id).first()

        result.append({
            "id": entry.id,
            "day": entry.day.value,
            "period": entry.period,
            "start_time": entry.start_time.strftime("%H:%M") if entry.start_time else None,
            "end_time": entry.end_time.strftime("%H:%M") if entry.end_time else None,
            "class_id": entry.class_id,
            "class_name": f"{class_info.name} {class_info.section or ''}" if class_info else None,
            "subject_name": subject.name if subject else None,
            "room": entry.room
        })

    return result


# Assignment Submissions
@router.get("/assignments/{assignment_id}/submissions")
async def get_assignment_submissions(
    assignment_id: int,
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Get all submissions for an assignment"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.teacher_id == teacher.id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    submissions = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id
    ).all()

    result = []
    for sub in submissions:
        student = db.query(Student).filter(Student.id == sub.student_id).first()
        result.append({
            "id": sub.id,
            "student_id": sub.student_id,
            "student_name": student.name if student else None,
            "roll_no": student.roll_no if student else None,
            "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
            "file_url": sub.file_url,
            "remarks": sub.remarks,
            "marks_obtained": float(sub.marks_obtained) if sub.marks_obtained else None,
            "feedback": sub.feedback,
            "graded_at": sub.graded_at.isoformat() if sub.graded_at else None
        })

    return {
        "assignment": {
            "id": assignment.id,
            "title": assignment.title,
            "max_marks": assignment.max_marks
        },
        "submissions": result
    }


@router.put("/submissions/{submission_id}/grade")
async def grade_submission(
    submission_id: int,
    marks_obtained: float,
    feedback: str = None,
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Grade a student submission"""
    from datetime import datetime

    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    submission = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.id == submission_id
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Verify teacher owns this assignment
    assignment = db.query(Assignment).filter(
        Assignment.id == submission.assignment_id,
        Assignment.teacher_id == teacher.id
    ).first()

    if not assignment:
        raise HTTPException(status_code=403, detail="Not authorized to grade this submission")

    submission.marks_obtained = marks_obtained
    submission.feedback = feedback
    submission.graded_at = datetime.utcnow()

    db.commit()
    return {"message": "Submission graded successfully"}


# Teacher Notices
@router.get("/notices")
async def get_teacher_notices(
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Get notices for teachers"""
    notices = db.query(Notice).filter(
        Notice.is_active == True,
        (Notice.target_role == None) | (Notice.target_role == UserRole.TEACHER)
    ).order_by(Notice.created_at.desc()).all()

    return [
        {
            "id": n.id,
            "title": n.title,
            "content": n.content,
            "priority": n.priority,
            "attachment_url": n.attachment_url,
            "created_at": n.created_at.isoformat() if n.created_at else None,
            "expires_at": n.expires_at.isoformat() if n.expires_at else None
        }
        for n in notices
    ]


# Get teacher's subjects (for dropdowns)
@router.get("/my-subjects")
async def get_teacher_subjects(
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Get all subjects assigned to the teacher"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    return [
        {
            "id": s.id,
            "name": s.name,
            "code": s.code,
            "class_id": s.class_id
        }
        for s in teacher.subjects
    ]


# Get teacher's classes (simplified for dropdowns)
@router.get("/my-classes")
async def get_teacher_classes_simple(
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Get all classes assigned to the teacher (simplified)"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    return [
        {
            "id": c.id,
            "name": c.name,
            "section": c.section,
            "display_name": f"{c.name} {c.section or ''}".strip()
        }
        for c in teacher.classes
    ]


# ============ MESSAGES ============

@router.get("/messages/parents", response_model=List[ConversationParent])
async def get_parents_for_messaging(
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Get list of parents the teacher can message (parents of students in teacher's classes)"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    # Get all students in teacher's classes
    class_ids = [c.id for c in teacher.classes]
    students = db.query(Student).filter(Student.class_id.in_(class_ids)).all()

    # Get unique parents
    parent_ids = set(s.parent_id for s in students if s.parent_id)
    parents = db.query(Parent).filter(Parent.id.in_(parent_ids)).all()

    result = []
    for parent in parents:
        # Get students of this parent in teacher's classes
        parent_students = [s for s in students if s.parent_id == parent.id]
        if not parent_students:
            continue

        student = parent_students[0]  # Primary student for display
        class_info = db.query(Class).filter(Class.id == student.class_id).first()

        # Get last message and unread count
        last_msg = db.query(Message).filter(
            or_(
                and_(
                    Message.sender_id == teacher.id,
                    Message.sender_type == MessageParticipantType.TEACHER,
                    Message.receiver_id == parent.id,
                    Message.receiver_type == MessageParticipantType.PARENT
                ),
                and_(
                    Message.sender_id == parent.id,
                    Message.sender_type == MessageParticipantType.PARENT,
                    Message.receiver_id == teacher.id,
                    Message.receiver_type == MessageParticipantType.TEACHER
                )
            )
        ).order_by(Message.created_at.desc()).first()

        unread_count = db.query(Message).filter(
            Message.sender_id == parent.id,
            Message.sender_type == MessageParticipantType.PARENT,
            Message.receiver_id == teacher.id,
            Message.receiver_type == MessageParticipantType.TEACHER,
            Message.is_read == False
        ).count()

        result.append(ConversationParent(
            id=parent.id,
            name=parent.name,
            student_name=student.name,
            student_class=f"{class_info.name} {class_info.section or ''}" if class_info else "",
            last_message=last_msg.content[:50] + "..." if last_msg and len(last_msg.content) > 50 else (last_msg.content if last_msg else None),
            last_message_time=last_msg.created_at if last_msg else None,
            unread_count=unread_count
        ))

    # Sort by last message time (most recent first)
    result.sort(key=lambda x: x.last_message_time or datetime.min, reverse=True)

    return result


@router.get("/messages/parent/{parent_id}", response_model=List[MessageResponse])
async def get_conversation_with_parent(
    parent_id: int,
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Get all messages between the teacher and a specific parent"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    parent = db.query(Parent).filter(Parent.id == parent_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")

    messages = db.query(Message).filter(
        or_(
            and_(
                Message.sender_id == teacher.id,
                Message.sender_type == MessageParticipantType.TEACHER,
                Message.receiver_id == parent.id,
                Message.receiver_type == MessageParticipantType.PARENT
            ),
            and_(
                Message.sender_id == parent.id,
                Message.sender_type == MessageParticipantType.PARENT,
                Message.receiver_id == teacher.id,
                Message.receiver_type == MessageParticipantType.TEACHER
            )
        )
    ).order_by(Message.created_at.asc()).all()

    # Mark unread messages from parent as read
    db.query(Message).filter(
        Message.sender_id == parent.id,
        Message.sender_type == MessageParticipantType.PARENT,
        Message.receiver_id == teacher.id,
        Message.receiver_type == MessageParticipantType.TEACHER,
        Message.is_read == False
    ).update({"is_read": True, "read_at": datetime.now()})
    db.commit()

    return messages


@router.post("/messages/send", response_model=MessageResponse)
async def send_message_to_parent(
    parent_id: int,
    content: str,
    student_id: int = None,
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Send a message to a parent"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    parent = db.query(Parent).filter(Parent.id == parent_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")

    # Create the message
    message = Message(
        sender_id=teacher.id,
        sender_type=MessageParticipantType.TEACHER,
        receiver_id=parent.id,
        receiver_type=MessageParticipantType.PARENT,
        content=content,
        student_id=student_id,
        is_read=False
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


@router.put("/messages/{message_id}/read")
async def mark_message_as_read(
    message_id: int,
    current_user: User = Depends(require_role([UserRole.TEACHER])),
    db: Session = Depends(get_db)
):
    """Mark a message as read"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    message = db.query(Message).filter(
        Message.id == message_id,
        Message.receiver_id == teacher.id,
        Message.receiver_type == MessageParticipantType.TEACHER
    ).first()

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    message.is_read = True
    message.read_at = datetime.now()
    db.commit()

    return {"message": "Message marked as read"}
