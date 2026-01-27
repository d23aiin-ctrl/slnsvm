from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Admission, AdmissionStatus
from app.schemas import AdmissionCreate, AdmissionResponse, AdmissionInquiry

router = APIRouter(prefix="/admissions", tags=["Admissions"])


@router.post("/inquiry", response_model=AdmissionResponse)
async def submit_inquiry(
    inquiry: AdmissionInquiry,
    db: Session = Depends(get_db)
):
    """Public endpoint for admission inquiry"""
    admission = Admission(
        student_name=inquiry.student_name,
        dob=None,
        parent_name=inquiry.parent_name,
        parent_phone=inquiry.parent_phone,
        parent_email=inquiry.parent_email,
        class_applied=inquiry.class_interested,
        status=AdmissionStatus.PENDING
    )
    db.add(admission)
    db.commit()
    db.refresh(admission)
    return admission


@router.post("/apply", response_model=AdmissionResponse)
async def submit_application(
    application: AdmissionCreate,
    db: Session = Depends(get_db)
):
    """Public endpoint for full admission application"""
    admission = Admission(
        student_name=application.student_name,
        dob=application.dob,
        gender=application.gender,
        parent_name=application.parent_name,
        parent_phone=application.parent_phone,
        parent_email=application.parent_email,
        address=application.address,
        class_applied=application.class_applied,
        previous_school=application.previous_school,
        previous_class=application.previous_class,
        status=AdmissionStatus.PENDING
    )
    db.add(admission)
    db.commit()
    db.refresh(admission)
    return admission


@router.get("/status/{admission_id}", response_model=AdmissionResponse)
async def check_status(
    admission_id: int,
    db: Session = Depends(get_db)
):
    """Check admission application status"""
    admission = db.query(Admission).filter(Admission.id == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Admission application not found")
    return admission
