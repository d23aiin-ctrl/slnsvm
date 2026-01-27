"""
Bulk Import/Export API endpoints for admin operations.
Supports CSV and Excel formats for Students, Teachers, Fees, etc.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
import pandas as pd
import io
from datetime import datetime, date

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.parent import Parent
from app.models.teacher import Teacher
from app.models.academic import Class, Subject
from app.models.fee import Fee
from app.models.attendance import Attendance
from app.core.security import get_password_hash

router = APIRouter(prefix="/bulk", tags=["Bulk Import/Export"])


# ==================== EXPORT ENDPOINTS ====================

@router.get("/export/students")
async def export_students(
    format: str = Query("csv", enum=["csv", "xlsx"]),
    class_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Export all students to CSV or Excel."""
    query = db.query(Student)
    if class_id:
        query = query.filter(Student.class_id == class_id)

    students = query.all()

    data = []
    for s in students:
        class_info = db.query(Class).filter(Class.id == s.class_id).first()
        parent_info = db.query(Parent).filter(Parent.id == s.parent_id).first()
        user_info = db.query(User).filter(User.id == s.user_id).first()

        data.append({
            "admission_no": s.admission_no,
            "name": s.name,
            "email": user_info.email if user_info else "",
            "class": class_info.name if class_info else "",
            "section": s.section,
            "roll_no": s.roll_no,
            "dob": s.dob.strftime("%Y-%m-%d") if s.dob else "",
            "gender": s.gender,
            "phone": s.phone,
            "address": s.address,
            "blood_group": s.blood_group,
            "parent_name": parent_info.name if parent_info else "",
            "parent_phone": parent_info.phone if parent_info else "",
        })

    df = pd.DataFrame(data)

    if format == "xlsx":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Students')
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=students_{datetime.now().strftime('%Y%m%d')}.xlsx"}
        )
    else:
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=students_{datetime.now().strftime('%Y%m%d')}.csv"}
        )


@router.get("/export/teachers")
async def export_teachers(
    format: str = Query("csv", enum=["csv", "xlsx"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Export all teachers to CSV or Excel."""
    teachers = db.query(Teacher).all()

    data = []
    for t in teachers:
        user_info = db.query(User).filter(User.id == t.user_id).first()
        data.append({
            "employee_id": t.employee_id,
            "name": t.name,
            "email": user_info.email if user_info else "",
            "phone": t.phone,
            "qualification": t.qualification,
            "experience_years": t.experience_years,
            "join_date": t.join_date.strftime("%Y-%m-%d") if t.join_date else "",
            "address": t.address,
        })

    df = pd.DataFrame(data)

    if format == "xlsx":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Teachers')
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=teachers_{datetime.now().strftime('%Y%m%d')}.xlsx"}
        )
    else:
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=teachers_{datetime.now().strftime('%Y%m%d')}.csv"}
        )


@router.get("/export/fees")
async def export_fees(
    format: str = Query("csv", enum=["csv", "xlsx"]),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Export fees to CSV or Excel."""
    query = db.query(Fee)
    if status:
        query = query.filter(Fee.status == status)

    fees = query.all()

    data = []
    for f in fees:
        student = db.query(Student).filter(Student.id == f.student_id).first()
        data.append({
            "student_admission_no": student.admission_no if student else "",
            "student_name": student.name if student else "",
            "fee_type": f.fee_type,
            "amount": float(f.amount),
            "due_date": f.due_date.strftime("%Y-%m-%d") if f.due_date else "",
            "paid_date": f.paid_date.strftime("%Y-%m-%d") if f.paid_date else "",
            "status": f.status,
            "payment_method": f.payment_method or "",
            "transaction_id": f.transaction_id or "",
        })

    df = pd.DataFrame(data)

    if format == "xlsx":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Fees')
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=fees_{datetime.now().strftime('%Y%m%d')}.xlsx"}
        )
    else:
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=fees_{datetime.now().strftime('%Y%m%d')}.csv"}
        )


@router.get("/export/attendance")
async def export_attendance(
    format: str = Query("csv", enum=["csv", "xlsx"]),
    class_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER]))
):
    """Export attendance records to CSV or Excel."""
    query = db.query(Attendance)

    if start_date:
        query = query.filter(Attendance.date >= datetime.strptime(start_date, "%Y-%m-%d").date())
    if end_date:
        query = query.filter(Attendance.date <= datetime.strptime(end_date, "%Y-%m-%d").date())

    attendance_records = query.all()

    data = []
    for a in attendance_records:
        student = db.query(Student).filter(Student.id == a.student_id).first()
        if class_id and student and student.class_id != class_id:
            continue
        data.append({
            "date": a.date.strftime("%Y-%m-%d") if a.date else "",
            "student_admission_no": student.admission_no if student else "",
            "student_name": student.name if student else "",
            "status": a.status,
            "remarks": a.remarks or "",
        })

    df = pd.DataFrame(data)

    if format == "xlsx":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Attendance')
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=attendance_{datetime.now().strftime('%Y%m%d')}.xlsx"}
        )
    else:
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=attendance_{datetime.now().strftime('%Y%m%d')}.csv"}
        )


# ==================== TEMPLATE ENDPOINTS ====================

@router.get("/template/students")
async def get_student_template(
    format: str = Query("csv", enum=["csv", "xlsx"]),
):
    """Get template for bulk student import."""
    data = [{
        "admission_no": "2024001",
        "name": "Student Name",
        "email": "student@example.com",
        "password": "password123",
        "class_name": "Class 10",
        "section": "A",
        "roll_no": 1,
        "dob": "2008-05-15",
        "gender": "Male",
        "phone": "+91-9876543210",
        "address": "Full Address",
        "blood_group": "O+",
        "parent_name": "Parent Name",
        "parent_phone": "+91-9876543211",
        "parent_email": "parent@example.com",
        "parent_relation": "Father",
    }]

    df = pd.DataFrame(data)

    if format == "xlsx":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Students')
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=student_import_template.xlsx"}
        )
    else:
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=student_import_template.csv"}
        )


@router.get("/template/teachers")
async def get_teacher_template(
    format: str = Query("csv", enum=["csv", "xlsx"]),
):
    """Get template for bulk teacher import."""
    data = [{
        "employee_id": "T001",
        "name": "Teacher Name",
        "email": "teacher@example.com",
        "password": "password123",
        "phone": "+91-9876543210",
        "qualification": "M.Sc. Mathematics",
        "experience_years": 5,
        "join_date": "2020-04-01",
        "address": "Full Address",
    }]

    df = pd.DataFrame(data)

    if format == "xlsx":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Teachers')
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=teacher_import_template.xlsx"}
        )
    else:
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=teacher_import_template.csv"}
        )


@router.get("/template/fees")
async def get_fee_template(
    format: str = Query("csv", enum=["csv", "xlsx"]),
):
    """Get template for bulk fee import."""
    data = [{
        "student_admission_no": "2024001",
        "fee_type": "Tuition Fee",
        "amount": 5000,
        "due_date": "2024-04-15",
        "description": "Monthly tuition fee for April 2024",
    }]

    df = pd.DataFrame(data)

    if format == "xlsx":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Fees')
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=fee_import_template.xlsx"}
        )
    else:
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=fee_import_template.csv"}
        )


# ==================== IMPORT ENDPOINTS ====================

@router.post("/import/students")
async def import_students(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Bulk import students from CSV or Excel file.
    Creates user accounts, parent records, and student profiles.
    """
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be CSV or Excel format")

    try:
        content = await file.read()

        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))

        required_columns = ['admission_no', 'name', 'email', 'password', 'class_name', 'section']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )

        results = {"success": 0, "failed": 0, "errors": []}

        for idx, row in df.iterrows():
            try:
                # Check if student already exists
                existing = db.query(Student).filter(Student.admission_no == str(row['admission_no'])).first()
                if existing:
                    results["errors"].append(f"Row {idx+2}: Admission no {row['admission_no']} already exists")
                    results["failed"] += 1
                    continue

                # Check if email already exists
                existing_user = db.query(User).filter(User.email == row['email']).first()
                if existing_user:
                    results["errors"].append(f"Row {idx+2}: Email {row['email']} already exists")
                    results["failed"] += 1
                    continue

                # Find or create class
                class_obj = db.query(Class).filter(
                    Class.name == row['class_name'],
                    Class.section == row.get('section', 'A')
                ).first()

                if not class_obj:
                    class_obj = Class(
                        name=row['class_name'],
                        section=row.get('section', 'A'),
                        academic_year="2024-25"
                    )
                    db.add(class_obj)
                    db.flush()

                # Create parent if provided
                parent_id = None
                if pd.notna(row.get('parent_name')) and pd.notna(row.get('parent_phone')):
                    parent_email = row.get('parent_email', f"parent_{row['admission_no']}@slnsvm.com")

                    # Check if parent user exists
                    parent_user = db.query(User).filter(User.email == parent_email).first()
                    if not parent_user:
                        parent_user = User(
                            email=parent_email,
                            password_hash=get_password_hash(row.get('password', 'parent123')),
                            role=UserRole.PARENT,
                            is_active=True
                        )
                        db.add(parent_user)
                        db.flush()

                    parent = Parent(
                        user_id=parent_user.id,
                        name=row['parent_name'],
                        phone=str(row['parent_phone']),
                        email=parent_email,
                        relation=row.get('parent_relation', 'Father')
                    )
                    db.add(parent)
                    db.flush()
                    parent_id = parent.id

                # Create student user
                student_user = User(
                    email=row['email'],
                    password_hash=get_password_hash(str(row['password'])),
                    role=UserRole.STUDENT,
                    is_active=True
                )
                db.add(student_user)
                db.flush()

                # Parse date
                dob = None
                if pd.notna(row.get('dob')):
                    if isinstance(row['dob'], str):
                        dob = datetime.strptime(row['dob'], "%Y-%m-%d").date()
                    else:
                        dob = row['dob'].date() if hasattr(row['dob'], 'date') else row['dob']

                # Create student profile
                student = Student(
                    user_id=student_user.id,
                    admission_no=str(row['admission_no']),
                    name=row['name'],
                    class_id=class_obj.id,
                    section=row.get('section', 'A'),
                    roll_no=int(row['roll_no']) if pd.notna(row.get('roll_no')) else None,
                    dob=dob,
                    gender=row.get('gender'),
                    phone=str(row.get('phone', '')),
                    address=row.get('address'),
                    blood_group=row.get('blood_group'),
                    parent_id=parent_id
                )
                db.add(student)
                results["success"] += 1

            except Exception as e:
                results["errors"].append(f"Row {idx+2}: {str(e)}")
                results["failed"] += 1

        db.commit()
        return results

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@router.post("/import/teachers")
async def import_teachers(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Bulk import teachers from CSV or Excel file."""
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be CSV or Excel format")

    try:
        content = await file.read()

        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))

        required_columns = ['employee_id', 'name', 'email', 'password']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )

        results = {"success": 0, "failed": 0, "errors": []}

        for idx, row in df.iterrows():
            try:
                # Check if teacher already exists
                existing = db.query(Teacher).filter(Teacher.employee_id == str(row['employee_id'])).first()
                if existing:
                    results["errors"].append(f"Row {idx+2}: Employee ID {row['employee_id']} already exists")
                    results["failed"] += 1
                    continue

                # Check if email already exists
                existing_user = db.query(User).filter(User.email == row['email']).first()
                if existing_user:
                    results["errors"].append(f"Row {idx+2}: Email {row['email']} already exists")
                    results["failed"] += 1
                    continue

                # Create teacher user
                teacher_user = User(
                    email=row['email'],
                    password_hash=get_password_hash(str(row['password'])),
                    role=UserRole.TEACHER,
                    is_active=True
                )
                db.add(teacher_user)
                db.flush()

                # Parse join date
                join_date = None
                if pd.notna(row.get('join_date')):
                    if isinstance(row['join_date'], str):
                        join_date = datetime.strptime(row['join_date'], "%Y-%m-%d").date()
                    else:
                        join_date = row['join_date'].date() if hasattr(row['join_date'], 'date') else row['join_date']

                # Create teacher profile
                teacher = Teacher(
                    user_id=teacher_user.id,
                    employee_id=str(row['employee_id']),
                    name=row['name'],
                    phone=str(row.get('phone', '')),
                    qualification=row.get('qualification'),
                    experience_years=int(row['experience_years']) if pd.notna(row.get('experience_years')) else None,
                    join_date=join_date,
                    address=row.get('address')
                )
                db.add(teacher)
                results["success"] += 1

            except Exception as e:
                results["errors"].append(f"Row {idx+2}: {str(e)}")
                results["failed"] += 1

        db.commit()
        return results

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@router.post("/import/fees")
async def import_fees(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Bulk import fees from CSV or Excel file."""
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be CSV or Excel format")

    try:
        content = await file.read()

        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))

        required_columns = ['student_admission_no', 'fee_type', 'amount', 'due_date']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )

        results = {"success": 0, "failed": 0, "errors": []}

        for idx, row in df.iterrows():
            try:
                # Find student
                student = db.query(Student).filter(
                    Student.admission_no == str(row['student_admission_no'])
                ).first()

                if not student:
                    results["errors"].append(f"Row {idx+2}: Student with admission no {row['student_admission_no']} not found")
                    results["failed"] += 1
                    continue

                # Parse due date
                due_date = None
                if pd.notna(row.get('due_date')):
                    if isinstance(row['due_date'], str):
                        due_date = datetime.strptime(row['due_date'], "%Y-%m-%d").date()
                    else:
                        due_date = row['due_date'].date() if hasattr(row['due_date'], 'date') else row['due_date']

                # Create fee record
                fee = Fee(
                    student_id=student.id,
                    fee_type=row['fee_type'],
                    amount=float(row['amount']),
                    due_date=due_date,
                    description=row.get('description'),
                    status='pending'
                )
                db.add(fee)
                results["success"] += 1

            except Exception as e:
                results["errors"].append(f"Row {idx+2}: {str(e)}")
                results["failed"] += 1

        db.commit()
        return results

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
