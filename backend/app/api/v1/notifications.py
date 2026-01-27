from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.services.notifications import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class SendNotificationRequest(BaseModel):
    recipient_emails: Optional[List[EmailStr]] = None
    recipient_phones: Optional[List[str]] = None
    subject: str
    message: str
    send_email: bool = True
    send_sms: bool = True


class FeeReminderRequest(BaseModel):
    student_id: int
    amount: float
    due_date: str


class NotificationResponse(BaseModel):
    success: bool
    message: str
    details: Optional[dict] = None


@router.post("/send", response_model=NotificationResponse)
async def send_notification(
    request: SendNotificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Send notifications to recipients (Admin only)."""

    if not request.recipient_emails and not request.recipient_phones:
        raise HTTPException(status_code=400, detail="At least one recipient required")

    # Prepare recipients list
    recipients = []
    if request.recipient_emails:
        for email in request.recipient_emails:
            recipients.append({"email": email, "phone": None})
    if request.recipient_phones:
        for i, phone in enumerate(request.recipient_phones):
            if i < len(recipients):
                recipients[i]["phone"] = phone
            else:
                recipients.append({"email": None, "phone": phone})

    # Send notifications in background
    async def send_notifications():
        await notification_service.send_bulk_notification(
            recipients=recipients,
            subject=request.subject,
            message=request.message,
            send_email=request.send_email,
            send_sms=request.send_sms
        )

    background_tasks.add_task(send_notifications)

    return NotificationResponse(
        success=True,
        message=f"Notifications queued for {len(recipients)} recipients",
        details={"total_recipients": len(recipients)}
    )


@router.post("/fee-reminder", response_model=NotificationResponse)
async def send_fee_reminder(
    request: FeeReminderRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Send fee payment reminder to parent (Admin only)."""

    from app.models.student import Student
    from app.models.parent import Parent

    # Get student and parent info
    student = db.query(Student).filter(Student.id == request.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    parent = db.query(Parent).filter(Parent.id == student.parent_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")

    # Send notification in background
    async def send_reminder():
        await notification_service.send_fee_reminder(
            email=parent.email,
            phone=parent.phone,
            student_name=student.name,
            amount=request.amount,
            due_date=request.due_date
        )

    background_tasks.add_task(send_reminder)

    return NotificationResponse(
        success=True,
        message=f"Fee reminder sent for {student.name}",
        details={"student_id": student.id, "amount": request.amount}
    )


@router.post("/attendance-alert/{student_id}")
async def send_attendance_alert(
    student_id: int,
    date: str,
    status: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "teacher"]))
):
    """Send attendance alert to parent."""

    from app.models.student import Student
    from app.models.parent import Parent

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    parent = db.query(Parent).filter(Parent.id == student.parent_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")

    async def send_alert():
        await notification_service.send_attendance_alert(
            email=parent.email,
            phone=parent.phone,
            student_name=student.name,
            date=date,
            status=status
        )

    background_tasks.add_task(send_alert)

    return {"success": True, "message": "Attendance alert sent"}


@router.get("/settings")
async def get_notification_settings(
    current_user: User = Depends(require_role(["admin"]))
):
    """Get notification service status."""
    return {
        "email_configured": notification_service.email_service.is_configured(),
        "sms_configured": notification_service.sms_service.is_configured(),
    }
