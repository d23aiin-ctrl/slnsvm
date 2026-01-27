"""
Notification Service for SMS and Email notifications.
Supports multiple providers for production use.
"""
import smtplib
import httpx
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List
from datetime import datetime
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailNotificationService:
    """Email notification service using SMTP."""

    def __init__(self):
        self.smtp_host = getattr(settings, 'SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_user = getattr(settings, 'SMTP_USER', None)
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', None)
        self.from_email = getattr(settings, 'EMAIL_FROM', 'noreply@slnsvm.edu')

    def is_configured(self) -> bool:
        return bool(self.smtp_user and self.smtp_password)

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> bool:
        """Send email notification."""
        if not self.is_configured():
            logger.warning("Email service not configured")
            return False

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"Sri Laxmi Narayan Saraswati Vidya Mandir <{self.from_email}>"
            msg['To'] = to_email

            # Plain text version
            msg.attach(MIMEText(body, 'plain'))

            # HTML version if provided
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to_email, msg.as_string())

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    async def send_fee_reminder(self, to_email: str, student_name: str, amount: float, due_date: str) -> bool:
        """Send fee payment reminder email."""
        subject = f"Fee Payment Reminder - Sri Laxmi Narayan Saraswati Vidya Mandir"
        body = f"""
Dear Parent/Guardian,

This is a reminder that the fee payment of ₹{amount:,.2f} for {student_name} is due on {due_date}.

Please ensure timely payment to avoid any late fees.

Payment Options:
- Online: Visit our parent portal at https://slnsvm.edu/parent
- Offline: Pay at the school fee counter during office hours

For any queries, please contact the school office.

Regards,
Sri Laxmi Narayan Saraswati Vidya Mandir
Bhagwanpur, Vaishali
        """

        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(to right, #ea580c, #c2410c); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0;">Fee Payment Reminder</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                    <p>Dear Parent/Guardian,</p>
                    <p>This is a reminder that the fee payment for <strong>{student_name}</strong> is due.</p>

                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c;">
                        <p style="margin: 0;"><strong>Amount:</strong> ₹{amount:,.2f}</p>
                        <p style="margin: 10px 0 0 0;"><strong>Due Date:</strong> {due_date}</p>
                    </div>

                    <p><strong>Payment Options:</strong></p>
                    <ul>
                        <li>Online: Visit our parent portal</li>
                        <li>Offline: Pay at the school fee counter</li>
                    </ul>

                    <p>For any queries, please contact the school office.</p>

                    <p style="margin-top: 30px;">
                        Regards,<br>
                        <strong>Sri Laxmi Narayan Saraswati Vidya Mandir</strong><br>
                        Bhagwanpur, Vaishali
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        return await self.send_email(to_email, subject, body, html_body)

    async def send_attendance_alert(self, to_email: str, student_name: str, date: str, status: str) -> bool:
        """Send attendance alert email."""
        subject = f"Attendance Alert - {student_name}"
        body = f"""
Dear Parent/Guardian,

This is to inform you that {student_name} was marked as {status} on {date}.

If this is unexpected, please contact the school office immediately.

Regards,
Sri Laxmi Narayan Saraswati Vidya Mandir
        """
        return await self.send_email(to_email, subject, body)

    async def send_result_notification(self, to_email: str, student_name: str, exam_name: str) -> bool:
        """Send result publication notification."""
        subject = f"Results Published - {exam_name}"
        body = f"""
Dear Parent/Guardian,

The results for {exam_name} have been published for {student_name}.

Please login to the parent portal to view the detailed result.

Regards,
Sri Laxmi Narayan Saraswati Vidya Mandir
        """
        return await self.send_email(to_email, subject, body)


class SMSNotificationService:
    """SMS notification service using external API (MSG91, Twilio, etc.)."""

    def __init__(self):
        self.api_key = getattr(settings, 'SMS_API_KEY', None)
        self.sender_id = getattr(settings, 'SMS_SENDER_ID', 'SLNSVM')
        self.api_url = getattr(settings, 'SMS_API_URL', None)

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_url)

    async def send_sms(self, phone_number: str, message: str) -> bool:
        """Send SMS notification."""
        if not self.is_configured():
            logger.warning("SMS service not configured")
            return False

        try:
            # This is a generic implementation
            # Replace with actual SMS API implementation (MSG91, Twilio, etc.)
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    json={
                        "api_key": self.api_key,
                        "sender": self.sender_id,
                        "to": phone_number,
                        "message": message,
                    },
                    timeout=30.0
                )
                response.raise_for_status()

            logger.info(f"SMS sent successfully to {phone_number}")
            return True

        except Exception as e:
            logger.error(f"Failed to send SMS to {phone_number}: {str(e)}")
            return False

    async def send_fee_reminder_sms(self, phone: str, student_name: str, amount: float) -> bool:
        """Send fee reminder SMS."""
        message = f"SLNSVM: Dear Parent, fee of Rs.{amount:.0f} for {student_name} is pending. Pay online or visit school. -Sri Laxmi Narayan Saraswati Vidya Mandir"
        return await self.send_sms(phone, message)

    async def send_attendance_sms(self, phone: str, student_name: str, status: str) -> bool:
        """Send attendance SMS."""
        message = f"SLNSVM: {student_name} was marked {status} today. -Sri Laxmi Narayan Saraswati Vidya Mandir"
        return await self.send_sms(phone, message)

    async def send_otp_sms(self, phone: str, otp: str) -> bool:
        """Send OTP SMS."""
        message = f"SLNSVM: Your OTP is {otp}. Valid for 10 minutes. Do not share. -Sri Laxmi Narayan Saraswati Vidya Mandir"
        return await self.send_sms(phone, message)


class NotificationService:
    """Combined notification service for both Email and SMS."""

    def __init__(self):
        self.email_service = EmailNotificationService()
        self.sms_service = SMSNotificationService()

    async def send_fee_reminder(
        self,
        email: Optional[str],
        phone: Optional[str],
        student_name: str,
        amount: float,
        due_date: str
    ) -> dict:
        """Send fee reminder via email and SMS."""
        results = {"email": False, "sms": False}

        if email:
            results["email"] = await self.email_service.send_fee_reminder(
                email, student_name, amount, due_date
            )

        if phone:
            results["sms"] = await self.sms_service.send_fee_reminder_sms(
                phone, student_name, amount
            )

        return results

    async def send_attendance_alert(
        self,
        email: Optional[str],
        phone: Optional[str],
        student_name: str,
        date: str,
        status: str
    ) -> dict:
        """Send attendance alert via email and SMS."""
        results = {"email": False, "sms": False}

        if email:
            results["email"] = await self.email_service.send_attendance_alert(
                email, student_name, date, status
            )

        if phone:
            results["sms"] = await self.sms_service.send_attendance_sms(
                phone, student_name, status
            )

        return results

    async def send_bulk_notification(
        self,
        recipients: List[dict],
        subject: str,
        message: str,
        send_email: bool = True,
        send_sms: bool = True
    ) -> dict:
        """Send bulk notifications to multiple recipients."""
        results = {"total": len(recipients), "email_sent": 0, "sms_sent": 0, "failed": 0}

        for recipient in recipients:
            email = recipient.get("email")
            phone = recipient.get("phone")

            if send_email and email:
                if await self.email_service.send_email(email, subject, message):
                    results["email_sent"] += 1
                else:
                    results["failed"] += 1

            if send_sms and phone:
                if await self.sms_service.send_sms(phone, message[:160]):
                    results["sms_sent"] += 1
                else:
                    results["failed"] += 1

        return results


# Singleton instance
notification_service = NotificationService()
