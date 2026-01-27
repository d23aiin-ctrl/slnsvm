"""
Seed script to populate demo data for SLNSVM School Management System.
Creates: 1 Admin, 10 Teachers, 20 Parents, 30 Students with full related data.

Run with: python seed_demo_data.py
"""

import sys
import os
import random
from datetime import date, time, datetime, timedelta
from decimal import Decimal

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.parent import Parent
from app.models.teacher import Teacher
from app.models.admin import Admin
from app.models.academic import Class, Subject, Timetable, DayOfWeek
from app.models.notice import Notice
from app.models.fee import Fee, FeeType, FeeStatus
from app.models.attendance import Attendance, AttendanceStatus
from app.models.exam import Exam, ExamSchedule, ExamResult
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.admission import Admission, AdmissionStatus
from app.models.message import Message, MessageParticipantType

# Bihar-specific data
MALE_NAMES = ["Rahul", "Amit", "Vijay", "Sanjay", "Ravi", "Deepak", "Arun", "Sunil", "Manoj", "Rajesh",
              "Vikash", "Prashant", "Nikhil", "Akash", "Sumit", "Rohit", "Gaurav", "Pankaj", "Santosh", "Ajay"]
FEMALE_NAMES = ["Priya", "Anjali", "Pooja", "Neha", "Shreya", "Khushi", "Ritu", "Nisha", "Anita", "Suman",
                "Kajal", "Sapna", "Rekha", "Sunita", "Manju", "Pinky", "Sweta", "Geeta", "Mamta", "Rani"]
SURNAMES = ["Kumar", "Singh", "Prasad", "Sharma", "Verma", "Yadav", "Gupta", "Mishra", "Pandey", "Jha"]
VILLAGES = ["Bhagwanpur", "Hajipur", "Vaishali", "Jandaha", "Mahua", "Lalganj", "Patepur", "Bidupur"]
OCCUPATIONS = ["Farmer", "Government Employee", "Teacher", "Shopkeeper", "Business", "Doctor", "Engineer", "Driver"]


def seed_database():
    """Seed the database with demo data."""
    db = SessionLocal()

    try:
        print("Starting database seeding...")

        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"Database already has {existing_users} users. Skipping seed.")
            return

        demo_password = get_password_hash("demo123")

        # ==================== ADMIN ====================
        print("Creating Admin...")
        admin_user = User(email="admin@slnsvm.com", password_hash=demo_password, role=UserRole.ADMIN, is_active=True)
        db.add(admin_user)
        db.flush()
        admin_profile = Admin(user_id=admin_user.id, name="Principal Admin", designation="Principal", phone="+91-9876543200")
        db.add(admin_profile)

        # ==================== CLASSES ====================
        print("Creating Classes...")
        classes = []
        for i in range(1, 11):
            class_obj = Class(name=f"Class {i}", section="A", academic_year="2024-25", room_number=f"Room {i}A")
            db.add(class_obj)
            classes.append(class_obj)
        db.flush()

        # ==================== SUBJECTS ====================
        print("Creating Subjects...")
        subject_names = ["Mathematics", "Science", "English", "Hindi", "Social Science", "Computer"]
        subjects = []
        for class_obj in classes:
            for subj_name in subject_names:
                subject = Subject(
                    name=subj_name,
                    code=f"{subj_name[:3].upper()}{class_obj.name.split()[-1]}",
                    class_id=class_obj.id,
                    description=f"{subj_name} for {class_obj.name}"
                )
                db.add(subject)
                subjects.append(subject)
        db.flush()

        # ==================== 10 TEACHERS ====================
        print("Creating 10 Teachers...")
        teachers_data = [
            ("teacher@slnsvm.com", "Rajesh Kumar", "T001", "M.Sc. Mathematics", 10),
            ("teacher2@slnsvm.com", "Priya Sharma", "T002", "M.Sc. Physics", 8),
            ("teacher3@slnsvm.com", "Amit Singh", "T003", "M.A. English", 5),
            ("teacher4@slnsvm.com", "Sunita Devi", "T004", "M.A. Hindi", 12),
            ("teacher5@slnsvm.com", "Vinod Prasad", "T005", "M.Sc. Chemistry", 7),
            ("teacher6@slnsvm.com", "Rekha Kumari", "T006", "M.A. Social Science", 9),
            ("teacher7@slnsvm.com", "Sanjay Gupta", "T007", "MCA Computer", 6),
            ("teacher8@slnsvm.com", "Anita Verma", "T008", "M.Sc. Biology", 11),
            ("teacher9@slnsvm.com", "Manoj Yadav", "T009", "M.A. Sanskrit", 15),
            ("teacher10@slnsvm.com", "Geeta Mishra", "T010", "B.P.Ed.", 8),
        ]
        teachers = []
        for email, name, emp_id, qual, exp in teachers_data:
            teacher_user = User(email=email, password_hash=demo_password, role=UserRole.TEACHER, is_active=True)
            db.add(teacher_user)
            db.flush()
            teacher = Teacher(
                user_id=teacher_user.id, employee_id=emp_id, name=name,
                phone=f"+91-98765432{len(teachers):02d}", qualification=qual,
                experience_years=exp, join_date=date(2024 - exp, 4, 1),
                address=f"{random.choice(VILLAGES)}, Vaishali, Bihar"
            )
            db.add(teacher)
            teachers.append(teacher)
        db.flush()

        # ==================== ASSIGN TEACHERS TO CLASSES AND SUBJECTS ====================
        print("Assigning Teachers to Classes and Subjects...")
        # Map teachers to their subjects based on qualification
        teacher_subject_map = {
            0: "Mathematics",     # T001 - M.Sc. Mathematics
            1: "Science",         # T002 - M.Sc. Physics
            2: "English",         # T003 - M.A. English
            3: "Hindi",           # T004 - M.A. Hindi
            4: "Science",         # T005 - M.Sc. Chemistry
            5: "Social Science",  # T006 - M.A. Social Science
            6: "Computer",        # T007 - MCA Computer
            7: "Science",         # T008 - M.Sc. Biology
            8: "Hindi",           # T009 - M.A. Sanskrit (teach Hindi)
            9: "Social Science",  # T010 - B.P.Ed. (teach Social Science)
        }

        # Group teachers by subject
        subject_teachers_groups = {}
        for i, teacher in enumerate(teachers):
            subject_name = teacher_subject_map.get(i, "Mathematics")
            if subject_name not in subject_teachers_groups:
                subject_teachers_groups[subject_name] = []
            subject_teachers_groups[subject_name].append((i, teacher))

        for i, teacher in enumerate(teachers):
            subject_name = teacher_subject_map.get(i, "Mathematics")
            teachers_for_subject = subject_teachers_groups[subject_name]
            teacher_index_in_group = [t[0] for t in teachers_for_subject].index(i)
            num_teachers_for_subject = len(teachers_for_subject)

            # Distribute classes among teachers - max 5 classes per teacher to avoid schedule conflicts
            assigned_classes = []
            for class_idx, class_obj in enumerate(classes):
                if class_idx % num_teachers_for_subject == teacher_index_in_group:
                    assigned_classes.append(class_obj)
                    if len(assigned_classes) >= 5:
                        break

            # Ensure at least 3 classes per teacher
            if len(assigned_classes) < 3:
                for class_obj in classes:
                    if class_obj not in assigned_classes:
                        assigned_classes.append(class_obj)
                    if len(assigned_classes) >= 4:
                        break

            teacher.classes = assigned_classes

            # Assign subjects matching their qualification in those classes
            teacher_subjects_list = [
                s for s in subjects
                if s.name == subject_name and s.class_id in [c.id for c in assigned_classes]
            ]
            teacher.subjects = teacher_subjects_list

        db.flush()

        # ==================== 20 PARENTS ====================
        print("Creating 20 Parents...")
        parents = []
        for i in range(20):
            is_demo = (i == 0)
            email = "parent@slnsvm.com" if is_demo else f"parent{i+1}@slnsvm.com"
            name = "Ramesh Prasad" if is_demo else f"{random.choice(MALE_NAMES)} {random.choice(SURNAMES)}"

            parent_user = User(email=email, password_hash=demo_password, role=UserRole.PARENT, is_active=True)
            db.add(parent_user)
            db.flush()
            parent = Parent(
                user_id=parent_user.id, name=name, phone=f"+91-98765{43000 + i}",
                email=email, occupation=random.choice(OCCUPATIONS),
                address=f"{random.choice(VILLAGES)}, Vaishali, Bihar - 844114", relation="Father"
            )
            db.add(parent)
            parents.append(parent)
        db.flush()

        # ==================== 30 STUDENTS ====================
        print("Creating 30 Students...")
        students = []
        for i in range(30):
            is_demo = (i == 0)
            email = "student@slnsvm.com" if is_demo else f"student{i+1}@slnsvm.com"
            is_male = random.choice([True, False])
            name = "Rahul Prasad" if is_demo else f"{random.choice(MALE_NAMES if is_male else FEMALE_NAMES)} {random.choice(SURNAMES)}"
            class_obj = classes[i % 10]  # Distribute across classes
            parent = parents[i % 20]  # Link to parents

            student_user = User(email=email, password_hash=demo_password, role=UserRole.STUDENT, is_active=True)
            db.add(student_user)
            db.flush()
            student = Student(
                user_id=student_user.id, admission_no=f"2024{i+1:03d}", name=name,
                class_id=class_obj.id, section="A", roll_no=(i % 10) + 1,
                dob=date(2024 - int(class_obj.name.split()[-1]) - 5, random.randint(1, 12), random.randint(1, 28)),
                gender="Male" if is_male else "Female",
                address=f"{random.choice(VILLAGES)}, Vaishali, Bihar - 844114",
                phone=f"+91-98765{44000 + i}", parent_id=parent.id,
                blood_group=random.choice(["A+", "B+", "O+", "AB+"])
            )
            db.add(student)
            students.append(student)
        db.flush()

        # ==================== TIMETABLE ====================
        print("Creating Timetable...")
        days = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY]
        times_schedule = [(time(9, 0), time(9, 45)), (time(9, 45), time(10, 30)), (time(10, 45), time(11, 30)),
                          (time(11, 30), time(12, 15)), (time(13, 0), time(13, 45)), (time(13, 45), time(14, 30))]

        # Build a lookup: (class_id, subject_name) -> teacher who teaches it in that class
        class_subject_teacher = {}
        for teacher in teachers:
            for cls in teacher.classes:
                for subj in teacher.subjects:
                    if subj.class_id == cls.id:
                        class_subject_teacher[(cls.id, subj.name)] = teacher

        for class_idx, class_obj in enumerate(classes):
            class_subjects = [s for s in subjects if s.class_id == class_obj.id]
            for day_idx, day in enumerate(days):
                for period, (start, end) in enumerate(times_schedule, 1):
                    # Offset by class index so each class has subjects at different periods
                    subject_idx = (period + day_idx + class_idx) % len(class_subjects)
                    subject = class_subjects[subject_idx]
                    # Find the teacher assigned to this class for this subject
                    teacher = class_subject_teacher.get((class_obj.id, subject.name))
                    # Only create timetable entry if a teacher is assigned
                    if teacher:
                        timetable = Timetable(
                            class_id=class_obj.id, day=day, period=period,
                            start_time=start, end_time=end, subject_id=subject.id,
                            teacher_id=teacher.id, room=class_obj.room_number
                        )
                        db.add(timetable)

        # ==================== ATTENDANCE (30 days) ====================
        print("Creating Attendance...")
        for student in students:
            for i in range(30):
                att_date = date.today() - timedelta(days=i)
                if att_date.weekday() == 6:  # Skip Sundays
                    continue
                status = random.choices([AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE], weights=[85, 10, 5])[0]
                attendance = Attendance(student_id=student.id, date=att_date, status=status, marked_by=teachers[0].id)
                db.add(attendance)

        # ==================== FEES ====================
        print("Creating Fees...")
        months = [(date(2024, m, 10), f"{date(2024, m, 1).strftime('%B')} 2024") for m in range(4, 13)]
        fee_amounts = {1: 1500, 2: 1500, 3: 1800, 4: 1800, 5: 2000, 6: 2200, 7: 2200, 8: 2500, 9: 2800, 10: 3000}

        for student in students:
            class_num = int(student.class_id) % 10 + 1
            fee_amount = fee_amounts.get(class_num, 2000)
            for due_date, month_name in months:
                status = random.choice([FeeStatus.PAID, FeeStatus.PAID, FeeStatus.PAID, FeeStatus.PENDING])
                fee = Fee(
                    student_id=student.id, amount=Decimal(str(fee_amount)), fee_type=FeeType.TUITION,
                    description=f"Tuition Fee - {month_name}", due_date=due_date,
                    paid_date=due_date - timedelta(days=random.randint(1, 5)) if status == FeeStatus.PAID else None,
                    paid_amount=Decimal(str(fee_amount)) if status == FeeStatus.PAID else None,
                    status=status, payment_method="Cash" if status == FeeStatus.PAID else None, academic_year="2024-25"
                )
                db.add(fee)

        # ==================== EXAMS ====================
        print("Creating Exams...")
        exams_data = [
            ("Unit Test 1", date(2024, 7, 15), date(2024, 7, 20)),
            ("Half Yearly", date(2024, 9, 15), date(2024, 9, 30)),
            ("Unit Test 2", date(2024, 11, 15), date(2024, 11, 20)),
            ("Annual Exam", date(2025, 2, 15), date(2025, 3, 15)),
        ]
        exams = []
        for name, start, end in exams_data:
            exam = Exam(name=name, academic_year="2024-25", start_date=start, end_date=end, description=f"{name} 2024-25")
            db.add(exam)
            db.flush()
            exams.append(exam)

            # Exam schedules for each class
            for class_obj in classes:
                class_subjects = [s for s in subjects if s.class_id == class_obj.id][:5]
                exam_date = start
                for subject in class_subjects:
                    schedule = ExamSchedule(
                        exam_id=exam.id, class_id=class_obj.id, subject_id=subject.id,
                        exam_date=exam_date, start_time="09:00", end_time="12:00",
                        max_marks=100, passing_marks=33, room=class_obj.room_number
                    )
                    db.add(schedule)
                    exam_date += timedelta(days=1)

        # ==================== EXAM RESULTS ====================
        print("Creating Exam Results...")
        for exam in exams[:2]:  # Results for first 2 exams
            for student in students:
                student_subjects = [s for s in subjects if s.class_id == student.class_id][:5]
                for subject in student_subjects:
                    marks = random.randint(35, 95)
                    grade = "A" if marks >= 80 else "B" if marks >= 60 else "C" if marks >= 40 else "D"
                    result = ExamResult(
                        exam_id=exam.id, student_id=student.id, subject_id=subject.id,
                        marks_obtained=marks, grade=grade, remarks="Good" if marks >= 60 else "Needs Improvement"
                    )
                    db.add(result)

        # ==================== ASSIGNMENTS ====================
        print("Creating Assignments...")
        for teacher in teachers:
            for cls in teacher.classes:
                for subj in teacher.subjects:
                    if subj.class_id == cls.id:
                        assignment = Assignment(
                            title=f"{subj.name} Assignment - {cls.name}",
                            description=f"Complete exercises from Chapter 1-3 for {subj.name}",
                            class_id=cls.id, subject_id=subj.id, teacher_id=teacher.id,
                            due_date=date.today() + timedelta(days=random.randint(7, 21)), max_marks=20
                        )
                        db.add(assignment)

        # ==================== NOTICES ====================
        print("Creating Notices...")
        notices_data = [
            ("Annual Day Celebration", "Annual Day on January 26th, 2025. All parents invited.", "high"),
            ("Winter Vacation", "School closed Dec 25 - Jan 1 for winter vacation.", "medium"),
            ("PTM Announcement", "Parent-Teacher Meeting on January 15th, 2025.", "high"),
            ("Fee Reminder", "Please clear pending fees before January 10th.", "high"),
            ("Sports Day", "Annual Sports Day on February 5th, 2025.", "medium"),
            ("Library Notice", "Return all library books before vacation.", "low"),
        ]
        for title, content, priority in notices_data:
            notice = Notice(title=title, content=content, priority=priority, target_role=None, created_by=admin_user.id, is_active=True)
            db.add(notice)

        # ==================== ADMISSIONS ====================
        print("Creating Admissions...")
        for i in range(5):
            admission = Admission(
                student_name=f"{random.choice(MALE_NAMES + FEMALE_NAMES)} {random.choice(SURNAMES)}",
                dob=date(2018, random.randint(1, 12), random.randint(1, 28)),
                gender=random.choice(["Male", "Female"]),
                parent_name=f"{random.choice(MALE_NAMES)} {random.choice(SURNAMES)}",
                parent_phone=f"+91-98765{45000 + i}",
                parent_email=f"inquiry{i+1}@gmail.com",
                address=f"{random.choice(VILLAGES)}, Vaishali, Bihar",
                class_applied=f"Class {random.randint(1, 5)}",
                previous_school="",
                status=random.choice([AdmissionStatus.PENDING, AdmissionStatus.UNDER_REVIEW, AdmissionStatus.APPROVED]),
                created_at=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            db.add(admission)

        # ==================== MESSAGES ====================
        print("Creating Demo Messages...")
        # Create sample conversations between parents and teachers
        sample_conversations = [
            # Parent 0 (demo parent) with Teacher 0 (demo teacher)
            [
                (0, 0, "parent", "Hello Sir, I wanted to discuss my child's progress in Mathematics."),
                (0, 0, "teacher", "Hello! Of course. Your child Rahul is doing well in class."),
                (0, 0, "parent", "That's great to hear! Is there anything I should focus on at home?"),
                (0, 0, "teacher", "I recommend practicing multiplication tables daily. It will help in upcoming chapters."),
                (0, 0, "parent", "Thank you for the suggestion. I'll make sure to do that."),
            ],
            # Parent 0 with Teacher 2 (English teacher)
            [
                (0, 2, "parent", "Good morning Ma'am. How is Rahul doing in English?"),
                (0, 2, "teacher", "Good morning! Rahul is very attentive in class. His reading skills are excellent."),
                (0, 2, "teacher", "However, we need to work on his handwriting. Please practice cursive writing at home."),
                (0, 2, "parent", "Sure, we will work on it. Thank you for letting me know."),
            ],
            # Parent 1 with Teacher 0
            [
                (1, 0, "parent", "Sir, my child was absent yesterday. Can you share what was taught?"),
                (1, 0, "teacher", "We covered Chapter 5 - Fractions. I'll send the notes through the student."),
                (1, 0, "parent", "Thank you so much Sir."),
            ],
        ]

        for conv in sample_conversations:
            for parent_idx, teacher_idx, sender_type, content in conv:
                if sender_type == "parent":
                    msg = Message(
                        sender_id=parents[parent_idx].id,
                        sender_type=MessageParticipantType.PARENT,
                        receiver_id=teachers[teacher_idx].id,
                        receiver_type=MessageParticipantType.TEACHER,
                        content=content,
                        student_id=students[parent_idx].id if parent_idx < len(students) else None,
                        is_read=True,
                        created_at=datetime.now() - timedelta(hours=random.randint(1, 48))
                    )
                else:
                    msg = Message(
                        sender_id=teachers[teacher_idx].id,
                        sender_type=MessageParticipantType.TEACHER,
                        receiver_id=parents[parent_idx].id,
                        receiver_type=MessageParticipantType.PARENT,
                        content=content,
                        student_id=students[parent_idx].id if parent_idx < len(students) else None,
                        is_read=True,
                        created_at=datetime.now() - timedelta(hours=random.randint(1, 48))
                    )
                db.add(msg)

        # Commit all changes
        db.commit()

        print("\n" + "="*50)
        print("DATABASE SEEDED SUCCESSFULLY!")
        print("="*50)
        print("\nCreated:")
        print(f"  - 1 Admin")
        print(f"  - 10 Teachers")
        print(f"  - 20 Parents")
        print(f"  - 30 Students")
        print(f"  - 10 Classes with Subjects")
        print(f"  - Timetable, Attendance, Fees, Exams, Results")
        print(f"  - Assignments, Notices, Admissions, Messages")
        print("\n" + "="*50)
        print("DEMO CREDENTIALS (Password: demo123)")
        print("="*50)
        print("Admin:   admin@slnsvm.com")
        print("Teacher: teacher@slnsvm.com")
        print("Parent:  parent@slnsvm.com")
        print("Student: student@slnsvm.com")
        print("="*50)

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
