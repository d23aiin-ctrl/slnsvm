"""
Seed Data Script for SLNSVM School Management System
Sri Laxmi Narayan Saraswati Vidya Mandir, Bhagwanpur, Vaishali, Bihar

This script populates the database with sample data relevant to Bihar schools.
Enable/disable via SEED_DATA_ENABLED environment variable.

Usage:
    cd backend
    python -m app.seed_data

Or set SEED_DATA_ENABLED=true in .env and restart the server.
"""

import logging
import sys
import os

# Add parent directory to path when running directly
if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.core.database import SessionLocal
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.parent import Parent
from app.models.admin import Admin
from app.models.academic import Class, Subject, Timetable, DayOfWeek
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.attendance import Attendance, AttendanceStatus
from app.models.fee import Fee, FeeType, FeeStatus
from app.models.notice import Notice
from app.models.admission import Admission, AdmissionStatus
from app.models.exam import Exam, ExamSchedule, ExamResult

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# ============================================
# Bihar-specific Names and Data
# ============================================

BIHAR_MALE_NAMES = [
    "Aditya Kumar", "Rahul Singh", "Amit Kumar", "Ravi Shankar", "Vikash Kumar",
    "Prashant Kumar", "Sanjay Kumar", "Rajesh Prasad", "Manish Kumar", "Vivek Kumar",
    "Deepak Kumar", "Nikhil Raj", "Akash Kumar", "Sumit Kumar", "Rohit Kumar",
    "Abhishek Ranjan", "Ankit Kumar", "Saurabh Kumar", "Prince Kumar", "Gaurav Kumar",
    "Ajay Kumar", "Vijay Kumar", "Rakesh Ranjan", "Sunil Kumar", "Pappu Kumar",
    "Santosh Kumar", "Manoj Kumar", "Pankaj Kumar", "Raju Kumar", "Ramesh Kumar"
]

BIHAR_FEMALE_NAMES = [
    "Priya Kumari", "Anjali Kumari", "Pooja Kumari", "Neha Kumari", "Shreya Kumari",
    "Khushi Kumari", "Ritu Kumari", "Nisha Kumari", "Anita Kumari", "Suman Kumari",
    "Aarti Kumari", "Kajal Kumari", "Sapna Kumari", "Rekha Kumari", "Sunita Kumari",
    "Manju Kumari", "Pinky Kumari", "Rinku Kumari", "Ranjana Kumari", "Sweta Kumari",
    "Geeta Kumari", "Seema Kumari", "Mamta Kumari", "Poonam Kumari", "Rani Kumari"
]

BIHAR_VILLAGES = [
    "Bhagwanpur", "Hajipur", "Vaishali", "Jandaha", "Mahua", "Lalganj", "Patepur",
    "Bidupur", "Raghopur", "Sahdei Buzurg", "Mahnar", "Rajapakar", "Desri",
    "Cheriya Bariarpur", "Goraul", "Paterhi", "Bhagwanpur Khurd", "Baligaon",
    "Chakma", "Sarai", "Bakhtiarpur", "Maner", "Bikram", "Daudnagar"
]

BIHAR_OCCUPATIONS = [
    "Farmer", "Government Employee", "Teacher", "Shopkeeper", "Driver",
    "Labour", "Business", "Doctor", "Engineer", "Bank Employee",
    "Police", "Army", "Private Job", "Self Employed", "Contractor"
]

TEACHER_QUALIFICATIONS = [
    "M.A. Hindi, B.Ed.", "M.Sc. Mathematics, B.Ed.", "M.Sc. Physics, B.Ed.",
    "M.Sc. Chemistry, B.Ed.", "M.A. English, B.Ed.", "M.A. Sanskrit, B.Ed.",
    "M.Sc. Biology, B.Ed.", "M.A. Social Science, B.Ed.", "MCA, B.Ed.",
    "M.Com., B.Ed.", "M.A. Economics, B.Ed.", "B.P.Ed., M.P.Ed.",
    "M.F.A. (Fine Arts)", "M.A. Music, B.Ed."
]


# ============================================
# Seed Data Functions
# ============================================

def create_admin_user(db: Session) -> tuple[User, Admin]:
    """Create super admin user"""
    admin_user = User(
        email="admin@slnsvm.com",
        password_hash=hash_password("demo123"),
        role=UserRole.ADMIN,
        is_active=True
    )
    db.add(admin_user)
    db.flush()

    admin = Admin(
        user_id=admin_user.id,
        name="Administrator",
        designation="System Administrator"
    )
    db.add(admin)
    return admin_user, admin


def create_demo_users(db: Session, classes: list) -> dict:
    """Create demo users with simple credentials for testing"""
    demo_users = {}

    # Demo Teacher
    teacher_user = User(
        email="teacher@slnsvm.com",
        password_hash=hash_password("demo123"),
        role=UserRole.TEACHER,
        is_active=True
    )
    db.add(teacher_user)
    db.flush()

    demo_teacher = Teacher(
        user_id=teacher_user.id,
        employee_id="DEMO001",
        name="Demo Teacher",
        phone="9876543210",
        qualification="M.A., B.Ed.",
        experience_years=5,
        join_date=date(2020, 4, 1),
        address="Bhagwanpur, Vaishali, Bihar"
    )
    db.add(demo_teacher)
    demo_users['teacher'] = (teacher_user, demo_teacher)

    # Demo Parent
    parent_user = User(
        email="parent@slnsvm.com",
        password_hash=hash_password("demo123"),
        role=UserRole.PARENT,
        is_active=True
    )
    db.add(parent_user)
    db.flush()

    demo_parent = Parent(
        user_id=parent_user.id,
        name="Demo Parent",
        phone="9876543211",
        email="parent@slnsvm.com",
        occupation="Business",
        address="Bhagwanpur, Vaishali, Bihar - 844114",
        relation="Father"
    )
    db.add(demo_parent)
    db.flush()
    demo_users['parent'] = (parent_user, demo_parent)

    # Demo Student
    student_user = User(
        email="student@slnsvm.com",
        password_hash=hash_password("demo123"),
        role=UserRole.STUDENT,
        is_active=True
    )
    db.add(student_user)
    db.flush()

    first_class = classes[0] if classes else None
    demo_student = Student(
        user_id=student_user.id,
        admission_no="DEMO2024001",
        name="Demo Student",
        class_id=first_class.id if first_class else None,
        section=first_class.section if first_class else "A",
        roll_no=1,
        dob=date(2015, 1, 1),
        gender="Male",
        address="Bhagwanpur, Vaishali, Bihar - 844114",
        phone="9876543212",
        parent_id=demo_parent.id,
        blood_group="O+"
    )
    db.add(demo_student)
    demo_users['student'] = (student_user, demo_student)

    db.flush()
    return demo_users


def create_teachers(db: Session) -> list[tuple[User, Teacher]]:
    """Create teacher users with Bihar context"""
    teachers_data = [
        {"name": "श्री राजेश कुमार सिंह", "name_en": "Rajesh Kumar Singh", "email": "rajesh.singh@slnsvm.edu", "phone": "9430218068", "qualification": "M.A. Hindi, B.Ed.", "experience": 15, "subjects": "Hindi"},
        {"name": "श्री अमित कुमार झा", "name_en": "Amit Kumar Jha", "email": "amit.jha@slnsvm.edu", "phone": "9876543211", "qualification": "M.Sc. Mathematics, B.Ed.", "experience": 12, "subjects": "Mathematics"},
        {"name": "श्री विनोद कुमार", "name_en": "Vinod Kumar", "email": "vinod.kumar@slnsvm.edu", "phone": "9876543212", "qualification": "M.Sc. Physics, B.Ed.", "experience": 10, "subjects": "Physics"},
        {"name": "श्रीमती सुमन कुमारी", "name_en": "Suman Kumari", "email": "suman.kumari@slnsvm.edu", "phone": "9876543213", "qualification": "M.Sc. Chemistry, B.Ed.", "experience": 8, "subjects": "Chemistry"},
        {"name": "श्री प्रदीप कुमार", "name_en": "Pradeep Kumar", "email": "pradeep.kumar@slnsvm.edu", "phone": "9876543214", "qualification": "M.A. English, B.Ed.", "experience": 11, "subjects": "English"},
        {"name": "श्री संजय कुमार", "name_en": "Sanjay Kumar", "email": "sanjay.kumar@slnsvm.edu", "phone": "9876543215", "qualification": "M.Sc. Biology, B.Ed.", "experience": 9, "subjects": "Biology"},
        {"name": "श्रीमती रेखा देवी", "name_en": "Rekha Devi", "email": "rekha.devi@slnsvm.edu", "phone": "9876543216", "qualification": "M.A. Social Science, B.Ed.", "experience": 7, "subjects": "Social Science"},
        {"name": "श्री मनोज कुमार", "name_en": "Manoj Kumar", "email": "manoj.kumar@slnsvm.edu", "phone": "9876543217", "qualification": "MCA, B.Ed.", "experience": 6, "subjects": "Computer Science"},
        {"name": "श्री राकेश रंजन", "name_en": "Rakesh Ranjan", "email": "rakesh.ranjan@slnsvm.edu", "phone": "9876543218", "qualification": "M.A. Sanskrit, B.Ed.", "experience": 14, "subjects": "Sanskrit"},
        {"name": "श्री विजय कुमार", "name_en": "Vijay Kumar", "email": "vijay.kumar@slnsvm.edu", "phone": "9876543219", "qualification": "B.P.Ed., M.P.Ed.", "experience": 10, "subjects": "Physical Education"},
        {"name": "श्रीमती गीता देवी", "name_en": "Geeta Devi", "email": "geeta.devi@slnsvm.edu", "phone": "9876543220", "qualification": "M.F.A. (Fine Arts)", "experience": 5, "subjects": "Art"},
        {"name": "श्री राम प्रसाद", "name_en": "Ram Prasad", "email": "ram.prasad@slnsvm.edu", "phone": "9876543221", "qualification": "M.A. Music, B.Ed.", "experience": 8, "subjects": "Music"},
    ]

    teachers = []
    for i, data in enumerate(teachers_data):
        user = User(
            email=data["email"],
            password_hash=hash_password("teacher123"),
            role=UserRole.TEACHER,
            is_active=True
        )
        db.add(user)
        db.flush()

        teacher = Teacher(
            user_id=user.id,
            employee_id=f"EMP{2024001 + i}",
            name=data["name"],
            phone=data["phone"],
            qualification=data["qualification"],
            experience_years=data["experience"],
            join_date=date(2024 - data["experience"], 4, 1),
            address=f"{BIHAR_VILLAGES[i % len(BIHAR_VILLAGES)]}, Vaishali, Bihar"
        )
        db.add(teacher)
        teachers.append((user, teacher))

    return teachers


def create_classes(db: Session, teachers: list) -> list[Class]:
    """Create classes from Nursery to Class 12"""
    classes_data = [
        {"name": "Nursery", "section": "A", "room": "G-01"},
        {"name": "LKG", "section": "A", "room": "G-02"},
        {"name": "UKG", "section": "A", "room": "G-03"},
        {"name": "Class 1", "section": "A", "room": "1-01"},
        {"name": "Class 1", "section": "B", "room": "1-02"},
        {"name": "Class 2", "section": "A", "room": "1-03"},
        {"name": "Class 2", "section": "B", "room": "1-04"},
        {"name": "Class 3", "section": "A", "room": "1-05"},
        {"name": "Class 4", "section": "A", "room": "2-01"},
        {"name": "Class 5", "section": "A", "room": "2-02"},
        {"name": "Class 6", "section": "A", "room": "2-03"},
        {"name": "Class 6", "section": "B", "room": "2-04"},
        {"name": "Class 7", "section": "A", "room": "2-05"},
        {"name": "Class 8", "section": "A", "room": "3-01"},
        {"name": "Class 9", "section": "A", "room": "3-02"},
        {"name": "Class 9", "section": "B", "room": "3-03"},
        {"name": "Class 10", "section": "A", "room": "3-04"},
        {"name": "Class 10", "section": "B", "room": "3-05"},
        {"name": "Class 11 Science", "section": "A", "room": "4-01"},
        {"name": "Class 11 Arts", "section": "A", "room": "4-02"},
        {"name": "Class 12 Science", "section": "A", "room": "4-03"},
        {"name": "Class 12 Arts", "section": "A", "room": "4-04"},
    ]

    classes = []
    for i, data in enumerate(classes_data):
        class_obj = Class(
            name=data["name"],
            section=data["section"],
            academic_year="2024-25",
            class_teacher_id=teachers[i % len(teachers)][1].id if teachers else None,
            room_number=data["room"]
        )
        db.add(class_obj)
        classes.append(class_obj)

    db.flush()
    return classes


def create_subjects(db: Session, classes: list[Class]) -> list[Subject]:
    """Create subjects for each class"""
    # Subjects by class level
    primary_subjects = ["Hindi", "English", "Mathematics", "EVS", "Drawing"]
    middle_subjects = ["Hindi", "English", "Mathematics", "Science", "Social Science", "Sanskrit", "Computer"]
    secondary_subjects = ["Hindi", "English", "Mathematics", "Science", "Social Science", "Sanskrit", "Computer", "Physical Education"]
    science_subjects = ["Physics", "Chemistry", "Biology/Mathematics", "English", "Hindi", "Computer Science"]
    arts_subjects = ["Hindi", "English", "History", "Political Science", "Geography", "Economics"]

    subjects = []
    for class_obj in classes:
        if "Nursery" in class_obj.name or "LKG" in class_obj.name or "UKG" in class_obj.name:
            subject_list = ["Hindi", "English", "Mathematics", "Drawing", "Rhymes"]
        elif any(x in class_obj.name for x in ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"]):
            subject_list = primary_subjects
        elif any(x in class_obj.name for x in ["Class 6", "Class 7", "Class 8"]):
            subject_list = middle_subjects
        elif any(x in class_obj.name for x in ["Class 9", "Class 10"]):
            subject_list = secondary_subjects
        elif "Science" in class_obj.name:
            subject_list = science_subjects
        else:
            subject_list = arts_subjects

        # Generate unique class code
        class_code = class_obj.name.replace(" ", "").replace("Class", "C")[:6].upper()
        if class_obj.section:
            class_code += class_obj.section

        for subj in subject_list:
            subject = Subject(
                name=subj,
                code=f"{class_code}-{subj[:3].upper()}-{class_obj.id}",
                class_id=class_obj.id,
                description=f"{subj} for {class_obj.name} {class_obj.section}"
            )
            db.add(subject)
            subjects.append(subject)

    db.flush()
    return subjects


def create_parents_and_students(db: Session, classes: list[Class]) -> tuple[list, list]:
    """Create parents and students with Bihar context"""
    import random

    parents = []
    students = []
    student_counter = 1

    for class_obj in classes:
        # Create 15-25 students per class
        num_students = random.randint(15, 25)

        for i in range(num_students):
            # Create parent
            is_male_parent = random.choice([True, False])
            parent_name = random.choice(BIHAR_MALE_NAMES if is_male_parent else BIHAR_FEMALE_NAMES)
            village = random.choice(BIHAR_VILLAGES)

            parent_user = User(
                email=f"parent{student_counter}@example.com",
                password_hash=hash_password("parent123"),
                role=UserRole.PARENT,
                is_active=True
            )
            db.add(parent_user)
            db.flush()

            parent = Parent(
                user_id=parent_user.id,
                name=f"श्री {parent_name}" if is_male_parent else f"श्रीमती {parent_name}",
                phone=f"98{random.randint(10000000, 99999999)}",
                email=f"parent{student_counter}@example.com",
                occupation=random.choice(BIHAR_OCCUPATIONS),
                address=f"{village}, Vaishali, Bihar - 844114",
                relation="Father" if is_male_parent else "Mother"
            )
            db.add(parent)
            db.flush()
            parents.append((parent_user, parent))

            # Create student
            is_male_student = random.choice([True, False])
            student_name = random.choice(BIHAR_MALE_NAMES if is_male_student else BIHAR_FEMALE_NAMES)

            student_user = User(
                email=f"student{student_counter}@slnsvm.edu",
                password_hash=hash_password("student123"),
                role=UserRole.STUDENT,
                is_active=True
            )
            db.add(student_user)
            db.flush()

            # Calculate age based on class
            base_age = 5  # Nursery age
            class_name = class_obj.name
            if "LKG" in class_name:
                base_age = 4
            elif "UKG" in class_name:
                base_age = 5
            elif "Nursery" in class_name:
                base_age = 3
            elif "Class" in class_name:
                try:
                    class_num = int(''.join(filter(str.isdigit, class_name.split()[1])))
                    base_age = 5 + class_num
                except:
                    base_age = 10

            dob_year = 2024 - base_age - random.randint(0, 1)

            student = Student(
                user_id=student_user.id,
                admission_no=f"SLNSVM{2024}{student_counter:04d}",
                name=student_name,
                class_id=class_obj.id,
                section=class_obj.section,
                roll_no=i + 1,
                dob=date(dob_year, random.randint(1, 12), random.randint(1, 28)),
                gender="Male" if is_male_student else "Female",
                address=f"{village}, Vaishali, Bihar - 844114",
                phone=f"98{random.randint(10000000, 99999999)}",
                parent_id=parent.id,
                blood_group=random.choice(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])
            )
            db.add(student)
            students.append((student_user, student))
            student_counter += 1

    db.flush()
    return parents, students


def create_timetable(db: Session, classes: list[Class], subjects: list[Subject], teachers: list) -> list[Timetable]:
    """Create timetable for classes"""
    import random

    timetables = []
    periods = [
        ("08:00", "08:45"),
        ("08:45", "09:30"),
        ("09:30", "10:15"),
        ("10:30", "11:15"),  # After break
        ("11:15", "12:00"),
        ("12:00", "12:45"),
        ("13:30", "14:15"),  # After lunch
        ("14:15", "15:00"),
    ]

    days = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY]

    for class_obj in classes:
        class_subjects = [s for s in subjects if s.class_id == class_obj.id]
        if not class_subjects:
            continue

        for day in days:
            for period_num, (start_time, end_time) in enumerate(periods, 1):
                subject = random.choice(class_subjects)
                teacher = random.choice(teachers)[1] if teachers else None

                timetable = Timetable(
                    class_id=class_obj.id,
                    day=day,
                    period=period_num,
                    start_time=start_time,
                    end_time=end_time,
                    subject_id=subject.id,
                    teacher_id=teacher.id if teacher else None,
                    room=class_obj.room_number
                )
                db.add(timetable)
                timetables.append(timetable)

    db.flush()
    return timetables


def create_notices(db: Session, admin_user: User) -> list[Notice]:
    """Create school notices"""
    notices_data = [
        {
            "title": "वार्षिक परीक्षा 2025 की तिथियां घोषित",
            "content": """प्रिय अभिभावकों और छात्रों,

सत्र 2024-25 की वार्षिक परीक्षा की तिथियां निम्नलिखित हैं:

कक्षा 1-5: 15 फरवरी 2025 से 28 फरवरी 2025
कक्षा 6-8: 20 फरवरी 2025 से 5 मार्च 2025
कक्षा 9-10: 1 मार्च 2025 से 15 मार्च 2025
कक्षा 11-12: 5 मार्च 2025 से 20 मार्च 2025

सभी छात्रों से अनुरोध है कि परीक्षा की तैयारी गंभीरता से करें।

धन्यवाद,
प्रधानाचार्य
श्री लक्ष्मी नारायण सरस्वती विद्या मंदिर""",
            "priority": "high",
            "target_role": None
        },
        {
            "title": "गणतंत्र दिवस समारोह 2025",
            "content": """प्रिय अभिभावकों,

विद्यालय में 26 जनवरी 2025 को गणतंत्र दिवस समारोह का आयोजन किया जाएगा। कार्यक्रम सुबह 8:00 बजे से प्रारंभ होगा।

कार्यक्रम में शामिल होंगे:
- ध्वजारोहण
- देशभक्ति गीत
- सांस्कृतिक कार्यक्रम
- पुरस्कार वितरण

सभी अभिभावकों से अनुरोध है कि वे इस समारोह में उपस्थित होकर बच्चों का उत्साहवर्धन करें।

प्रधानाचार्य""",
            "priority": "normal",
            "target_role": None
        },
        {
            "title": "शुल्क जमा करने की अंतिम तिथि",
            "content": """प्रिय अभिभावकों,

जनवरी-मार्च 2025 की तिमाही फीस जमा करने की अंतिम तिथि 15 जनवरी 2025 है। कृपया समय पर फीस जमा करें।

नोट: विलंब होने पर विलंब शुल्क देय होगा।

धन्यवाद,
लेखा विभाग""",
            "priority": "high",
            "target_role": UserRole.PARENT
        },
        {
            "title": "शिक्षक अभिभावक बैठक",
            "content": """प्रिय अभिभावकों,

दिनांक 20 जनवरी 2025 (शनिवार) को सुबह 10:00 बजे से शिक्षक-अभिभावक बैठक का आयोजन किया जाएगा।

एजेंडा:
1. छात्रों की शैक्षणिक प्रगति
2. उपस्थिति समीक्षा
3. आगामी परीक्षाओं की तैयारी
4. अन्य विषय

सभी अभिभावकों की उपस्थिति अनिवार्य है।

प्रधानाचार्य""",
            "priority": "normal",
            "target_role": UserRole.PARENT
        },
        {
            "title": "शीतकालीन अवकाश की सूचना",
            "content": """विद्यालय में शीतकालीन अवकाश 25 दिसंबर 2024 से 1 जनवरी 2025 तक रहेगा।

विद्यालय 2 जनवरी 2025 से यथावत खुलेगा।

प्रधानाचार्य""",
            "priority": "normal",
            "target_role": None
        },
        {
            "title": "विज्ञान प्रदर्शनी 2025",
            "content": """प्रिय छात्रों,

विद्यालय में विज्ञान प्रदर्शनी का आयोजन 5 फरवरी 2025 को किया जाएगा।

कक्षा 6-12 के सभी छात्र भाग ले सकते हैं। प्रोजेक्ट का विषय 25 जनवरी तक विज्ञान विभाग में जमा करें।

विज्ञान विभाग""",
            "priority": "normal",
            "target_role": UserRole.STUDENT
        }
    ]

    notices = []
    for i, data in enumerate(notices_data):
        notice = Notice(
            title=data["title"],
            content=data["content"],
            priority=data["priority"],
            target_role=data["target_role"],
            is_active=True,
            created_by=admin_user.id,
            created_at=datetime.now() - timedelta(days=i * 3)
        )
        db.add(notice)
        notices.append(notice)

    db.flush()
    return notices


def create_exams(db: Session, classes: list[Class], subjects: list[Subject]) -> list[Exam]:
    """Create exam schedules"""
    exams_data = [
        {"name": "Unit Test 1", "start_date": date(2024, 7, 15), "end_date": date(2024, 7, 20)},
        {"name": "Half Yearly Exam", "start_date": date(2024, 9, 15), "end_date": date(2024, 9, 30)},
        {"name": "Unit Test 2", "start_date": date(2024, 11, 15), "end_date": date(2024, 11, 20)},
        {"name": "Pre-Board Exam", "start_date": date(2025, 1, 5), "end_date": date(2025, 1, 15)},
        {"name": "Annual Exam", "start_date": date(2025, 2, 15), "end_date": date(2025, 3, 15)},
    ]

    exams = []
    for exam_data in exams_data:
        exam = Exam(
            name=exam_data["name"],
            academic_year="2024-25",
            start_date=exam_data["start_date"],
            end_date=exam_data["end_date"],
            description=f"{exam_data['name']} for academic year 2024-25"
        )
        db.add(exam)
        db.flush()
        exams.append(exam)

        # Create exam schedules for each class
        for class_obj in classes:
            class_subjects = [s for s in subjects if s.class_id == class_obj.id]
            exam_date = exam_data["start_date"]

            for subject in class_subjects[:5]:  # Max 5 subjects per exam
                schedule = ExamSchedule(
                    exam_id=exam.id,
                    class_id=class_obj.id,
                    subject_id=subject.id,
                    exam_date=exam_date,
                    start_time="09:00",
                    end_time="12:00",
                    max_marks=100,
                    passing_marks=33,
                    room=class_obj.room_number
                )
                db.add(schedule)
                exam_date = exam_date + timedelta(days=1)

    db.flush()
    return exams


def create_fees(db: Session, students: list) -> list[Fee]:
    """Create fee records for students"""
    import random

    fees = []
    fee_structure = {
        "Nursery": {"tuition": 1500, "admission": 2000},
        "LKG": {"tuition": 1500, "admission": 2000},
        "UKG": {"tuition": 1500, "admission": 2000},
        "Class 1": {"tuition": 1800, "admission": 2500},
        "Class 2": {"tuition": 1800, "admission": 2500},
        "Class 3": {"tuition": 2000, "admission": 2500},
        "Class 4": {"tuition": 2000, "admission": 2500},
        "Class 5": {"tuition": 2200, "admission": 3000},
        "Class 6": {"tuition": 2500, "admission": 3500},
        "Class 7": {"tuition": 2500, "admission": 3500},
        "Class 8": {"tuition": 2800, "admission": 4000},
        "Class 9": {"tuition": 3000, "admission": 4500},
        "Class 10": {"tuition": 3500, "admission": 5000},
        "Class 11": {"tuition": 4000, "admission": 6000},
        "Class 12": {"tuition": 4500, "admission": 6000},
    }

    months = [
        (date(2024, 4, 10), "April 2024"),
        (date(2024, 5, 10), "May 2024"),
        (date(2024, 6, 10), "June 2024"),
        (date(2024, 7, 10), "July 2024"),
        (date(2024, 8, 10), "August 2024"),
        (date(2024, 9, 10), "September 2024"),
        (date(2024, 10, 10), "October 2024"),
        (date(2024, 11, 10), "November 2024"),
        (date(2024, 12, 10), "December 2024"),
    ]

    for student_user, student in students[:100]:  # Limit to first 100 students for performance
        # Get fee amount based on class
        class_name = "Class 5"  # Default
        for key in fee_structure.keys():
            if key.lower() in str(student.class_id).lower():
                class_name = key
                break

        tuition_fee = fee_structure.get(class_name, {"tuition": 2000})["tuition"]

        for due_date, month_name in months:
            status = random.choice([FeeStatus.PAID, FeeStatus.PAID, FeeStatus.PAID, FeeStatus.PENDING])
            fee = Fee(
                student_id=student.id,
                amount=Decimal(str(tuition_fee)),
                fee_type=FeeType.TUITION,
                description=f"Tuition Fee - {month_name}",
                due_date=due_date,
                paid_date=due_date - timedelta(days=random.randint(1, 5)) if status == FeeStatus.PAID else None,
                paid_amount=Decimal(str(tuition_fee)) if status == FeeStatus.PAID else None,
                status=status,
                payment_method="Cash" if status == FeeStatus.PAID else None,
                academic_year="2024-25"
            )
            db.add(fee)
            fees.append(fee)

    db.flush()
    return fees


def create_attendance(db: Session, students: list, teachers: list) -> list[Attendance]:
    """Create attendance records"""
    import random

    attendance_records = []
    teacher = teachers[0][1] if teachers else None

    # Create attendance for last 30 days
    for i in range(30):
        attendance_date = date.today() - timedelta(days=i)

        # Skip Sundays
        if attendance_date.weekday() == 6:
            continue

        for student_user, student in students[:50]:  # Limit for performance
            status = random.choices(
                [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE],
                weights=[85, 10, 5]
            )[0]

            attendance = Attendance(
                student_id=student.id,
                date=attendance_date,
                status=status,
                marked_by=teacher.id if teacher else None
            )
            db.add(attendance)
            attendance_records.append(attendance)

    db.flush()
    return attendance_records


def create_assignments(db: Session, classes: list[Class], subjects: list[Subject], teachers: list) -> list[Assignment]:
    """Create assignments"""
    import random

    assignments = []
    assignment_titles = [
        ("Hindi", ["निबंध लेखन - मेरा विद्यालय", "पत्र लेखन अभ्यास", "व्याकरण कार्यपत्रक"]),
        ("English", ["Essay Writing - My School", "Letter Writing Practice", "Grammar Worksheet"]),
        ("Mathematics", ["Chapter 1 Exercise", "Practice Problems Set 1", "Word Problems Practice"]),
        ("Science", ["Chapter Summary Notes", "Diagram Practice", "Lab Report"]),
        ("Social Science", ["Map Work Assignment", "Project on Indian Freedom Fighters", "Chapter Questions"]),
    ]

    teacher = teachers[0][1] if teachers else None

    for class_obj in classes[:10]:  # Limit to first 10 classes
        class_subjects = [s for s in subjects if s.class_id == class_obj.id]

        for subject in class_subjects:
            titles = []
            for subj_name, title_list in assignment_titles:
                if subj_name.lower() in subject.name.lower():
                    titles = title_list
                    break

            if not titles:
                titles = ["Chapter Exercise", "Practice Worksheet", "Project Work"]

            for title in titles[:2]:  # 2 assignments per subject
                assignment = Assignment(
                    title=title,
                    description=f"{title} for {subject.name}. Submit in class notebook.",
                    class_id=class_obj.id,
                    subject_id=subject.id,
                    teacher_id=teacher.id if teacher else None,
                    due_date=date.today() + timedelta(days=random.randint(7, 21)),
                    max_marks=random.choice([10, 20, 25, 50])
                )
                db.add(assignment)
                assignments.append(assignment)

    db.flush()
    return assignments


def create_admissions(db: Session) -> list[Admission]:
    """Create admission inquiries"""
    import random

    admissions = []
    admission_data = [
        {"student": "राहुल कुमार", "parent": "श्री रामेश्वर प्रसाद", "class": "Class 1", "status": AdmissionStatus.APPROVED},
        {"student": "प्रिया कुमारी", "parent": "श्री सुनील कुमार", "class": "Class 6", "status": AdmissionStatus.PENDING},
        {"student": "आकाश कुमार", "parent": "श्री विजय सिंह", "class": "Class 9", "status": AdmissionStatus.UNDER_REVIEW},
        {"student": "नेहा कुमारी", "parent": "श्री मनोज कुमार", "class": "LKG", "status": AdmissionStatus.APPROVED},
        {"student": "विकास कुमार", "parent": "श्री संजय प्रसाद", "class": "Class 11 Science", "status": AdmissionStatus.PENDING},
        {"student": "अंजलि कुमारी", "parent": "श्री राकेश रंजन", "class": "Class 4", "status": AdmissionStatus.WAITLISTED},
        {"student": "रोहित कुमार", "parent": "श्री पंकज कुमार", "class": "Nursery", "status": AdmissionStatus.APPROVED},
        {"student": "स्वाति कुमारी", "parent": "श्री अमित कुमार", "class": "Class 8", "status": AdmissionStatus.REJECTED},
    ]

    for data in admission_data:
        village = random.choice(BIHAR_VILLAGES)
        admission = Admission(
            student_name=data["student"],
            dob=date(2024 - random.randint(4, 16), random.randint(1, 12), random.randint(1, 28)),
            gender=random.choice(["Male", "Female"]),
            parent_name=data["parent"],
            parent_phone=f"98{random.randint(10000000, 99999999)}",
            parent_email=f"parent{random.randint(100, 999)}@gmail.com",
            address=f"{village}, Vaishali, Bihar - 844114",
            class_applied=data["class"],
            previous_school=random.choice(["", "Primary School " + village, "Government School " + village]),
            status=data["status"],
            created_at=datetime.now() - timedelta(days=random.randint(1, 30))
        )
        db.add(admission)
        admissions.append(admission)

    db.flush()
    return admissions


def check_if_seeded(db: Session) -> bool:
    """Check if database already has seed data"""
    admin_exists = db.query(User).filter(User.email == "admin@slnsvm.com").first()
    return admin_exists is not None


def clear_all_data(db: Session):
    """Clear all data from database (use with caution)"""
    logger.warning("Clearing all existing data...")

    # Delete in order to respect foreign keys
    db.query(ExamResult).delete()
    db.query(ExamSchedule).delete()
    db.query(Exam).delete()
    db.query(AssignmentSubmission).delete()
    db.query(Assignment).delete()
    db.query(Attendance).delete()
    db.query(Fee).delete()
    db.query(Notice).delete()
    db.query(Admission).delete()
    db.query(Timetable).delete()
    db.query(Subject).delete()
    db.query(Student).delete()
    db.query(Parent).delete()
    db.query(Teacher).delete()
    db.query(Admin).delete()
    db.query(Class).delete()
    db.query(User).delete()

    db.commit()
    logger.info("All data cleared successfully")


def run_seed():
    """Main function to run seeding"""
    if not settings.SEED_DATA_ENABLED:
        logger.info("Seed data is disabled. Set SEED_DATA_ENABLED=true to enable.")
        return

    db = SessionLocal()

    try:
        # Check if already seeded
        if check_if_seeded(db):
            if settings.SEED_DATA_FORCE:
                logger.info("Force re-seeding enabled. Clearing existing data...")
                clear_all_data(db)
            else:
                logger.info("Database already seeded. Set SEED_DATA_FORCE=true to re-seed.")
                return

        logger.info("Starting database seeding for SLNSVM...")

        # Create admin
        logger.info("Creating admin user...")
        admin_user, admin = create_admin_user(db)

        # Create teachers
        logger.info("Creating teachers...")
        teachers = create_teachers(db)

        # Create classes
        logger.info("Creating classes...")
        classes = create_classes(db, teachers)

        # Create subjects
        logger.info("Creating subjects...")
        subjects = create_subjects(db, classes)

        # Create demo users
        logger.info("Creating demo users...")
        demo_users = create_demo_users(db, classes)

        # Create parents and students
        logger.info("Creating parents and students...")
        parents, students = create_parents_and_students(db, classes)

        # Create timetable
        logger.info("Creating timetable...")
        timetables = create_timetable(db, classes, subjects, teachers)

        # Create notices
        logger.info("Creating notices...")
        notices = create_notices(db, admin_user)

        # Create exams
        logger.info("Creating exams...")
        exams = create_exams(db, classes, subjects)

        # Create fees
        logger.info("Creating fee records...")
        fees = create_fees(db, students)

        # Create attendance
        logger.info("Creating attendance records...")
        attendance = create_attendance(db, students, teachers)

        # Create assignments
        logger.info("Creating assignments...")
        assignments = create_assignments(db, classes, subjects, teachers)

        # Create admissions
        logger.info("Creating admission inquiries...")
        admissions = create_admissions(db)

        db.commit()

        logger.info("=" * 50)
        logger.info("Database seeding completed successfully!")
        logger.info(f"Created: 1 Admin, {len(teachers)} Teachers, {len(classes)} Classes")
        logger.info(f"Created: {len(subjects)} Subjects, {len(students)} Students, {len(parents)} Parents")
        logger.info(f"Created: {len(notices)} Notices, {len(exams)} Exams, {len(assignments)} Assignments")
        logger.info("=" * 50)
        logger.info("\nDemo Login Credentials (Password: demo123):")
        logger.info("Admin: admin@slnsvm.com")
        logger.info("Teacher: teacher@slnsvm.com")
        logger.info("Parent: parent@slnsvm.com")
        logger.info("Student: student@slnsvm.com")
        logger.info("=" * 50)

    except Exception as e:
        logger.error(f"Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    # When running directly, force enable seeding
    print("\n" + "=" * 60)
    print("SLNSVM Seed Data Script")
    print("Sri Laxmi Narayan Saraswati Vidya Mandir, Bhagwanpur, Bihar")
    print("=" * 60 + "\n")

    # Override settings for direct execution
    settings.SEED_DATA_ENABLED = True

    # Check if user wants to force re-seed
    if len(sys.argv) > 1 and sys.argv[1] == "--force":
        settings.SEED_DATA_FORCE = True
        print("Force mode enabled - will clear existing data\n")

    run_seed()
