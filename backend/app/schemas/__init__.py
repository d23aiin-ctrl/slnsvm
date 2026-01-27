from app.schemas.user import (
    UserBase, UserCreate, UserUpdate, UserResponse,
    Token, TokenData, LoginRequest, RefreshTokenRequest
)
from app.schemas.student import (
    StudentBase, StudentCreate, StudentUpdate, StudentResponse, StudentDashboard
)
from app.schemas.parent import (
    ParentBase, ParentCreate, ParentUpdate, ParentResponse,
    ChildInfo, ParentDashboard
)
from app.schemas.teacher import (
    TeacherBase, TeacherCreate, TeacherUpdate, TeacherResponse,
    ClassInfo, TeacherDashboard
)
from app.schemas.academic import (
    ClassBase, ClassCreate, ClassUpdate, ClassResponse,
    SubjectBase, SubjectCreate, SubjectUpdate, SubjectResponse,
    TimetableEntry, TimetableCreate, TimetableResponse
)
from app.schemas.assignment import (
    AssignmentBase, AssignmentCreate, AssignmentUpdate, AssignmentResponse,
    SubmissionCreate, SubmissionGrade, SubmissionResponse
)
from app.schemas.attendance import (
    AttendanceBase, AttendanceCreate, AttendanceBulkCreate,
    AttendanceUpdate, AttendanceResponse,
    StudentAttendanceRecord, ClassAttendanceResponse, AttendanceSummary
)
from app.schemas.fee import (
    FeeBase, FeeCreate, FeeBulkCreate, FeeUpdate, FeeResponse,
    FeePayment, FeeSummary
)
from app.schemas.notice import NoticeBase, NoticeCreate, NoticeUpdate, NoticeResponse
from app.schemas.admission import (
    AdmissionBase, AdmissionCreate, AdmissionUpdate, AdmissionResponse,
    AdmissionInquiry
)
from app.schemas.exam import (
    ExamBase, ExamCreate, ExamUpdate, ExamResponse,
    ExamScheduleBase, ExamScheduleCreate, ExamScheduleResponse,
    ExamResultBase, ExamResultCreate, ExamResultBulkCreate,
    ExamResultResponse, StudentResultCard, TeacherMarksEntry, StudentMarkEntry
)
from app.schemas.message import (
    MessageCreate, MessageResponse, ConversationTeacher, ConversationParent,
    ConversationMessages, SendMessageRequest, MessageParticipantType as MessageParticipantTypeSchema
)
