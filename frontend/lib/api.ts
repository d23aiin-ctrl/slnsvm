import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://www.api.slnsvm.com'
    : 'http://localhost:8000');

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },
  register: async (data: { email: string; password: string; role: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Student API
export const studentApi = {
  getDashboard: async () => {
    const response = await api.get('/students/dashboard');
    return response.data;
  },
  getTimetable: async () => {
    const response = await api.get('/students/timetable');
    return response.data;
  },
  getAssignments: async () => {
    const response = await api.get('/students/assignments');
    return response.data;
  },
  getAssignmentsWithSubmissions: async () => {
    const response = await api.get('/students/assignments/with-submissions');
    return response.data;
  },
  submitAssignment: async (assignmentId: number, content?: string, fileUrl?: string) => {
    const response = await api.post(`/students/assignments/${assignmentId}/submit`, {
      content,
      file_url: fileUrl
    });
    return response.data;
  },
  getAttendance: async () => {
    const response = await api.get('/students/attendance');
    return response.data;
  },
  getResults: async () => {
    const response = await api.get('/students/results');
    return response.data;
  },
  getNotices: async () => {
    const response = await api.get('/students/notices');
    return response.data;
  },
  // Fees
  getFees: async () => {
    const response = await api.get('/students/fees');
    return response.data;
  },
  // Exam Schedule
  getExamSchedule: async () => {
    const response = await api.get('/students/exam-schedule');
    return response.data;
  },
  // Profile
  getProfile: async () => {
    const response = await api.get('/students/profile');
    return response.data;
  },
  // Messages
  getTeachersForMessaging: async () => {
    const response = await api.get('/students/messages/teachers');
    return response.data;
  },
  getConversation: async (teacherId: number) => {
    const response = await api.get(`/students/messages/teacher/${teacherId}`);
    return response.data;
  },
  sendMessage: async (teacherId: number, content: string) => {
    const response = await api.post('/students/messages/send', {
      teacher_id: teacherId,
      content
    });
    return response.data;
  },
  markMessageAsRead: async (messageId: number) => {
    const response = await api.put(`/students/messages/${messageId}/read`);
    return response.data;
  },
};

// Parent API
export const parentApi = {
  getDashboard: async () => {
    const response = await api.get('/parents/dashboard');
    return response.data;
  },
  getChildren: async () => {
    const response = await api.get('/parents/children');
    return response.data;
  },
  getFees: async () => {
    const response = await api.get('/parents/fees');
    return response.data;
  },
  payFee: async (feeId: number, amount: number, paymentMethod: string) => {
    const response = await api.post(`/parents/fees/pay?fee_id=${feeId}&amount=${amount}&payment_method=${paymentMethod}`);
    return response.data;
  },
  getAttendance: async () => {
    const response = await api.get('/parents/attendance');
    return response.data;
  },
  getNotices: async () => {
    const response = await api.get('/parents/notices');
    return response.data;
  },
  // Messages
  getTeachersForMessaging: async () => {
    const response = await api.get('/parents/messages/teachers');
    return response.data;
  },
  getConversation: async (teacherId: number) => {
    const response = await api.get(`/parents/messages/teacher/${teacherId}`);
    return response.data;
  },
  sendMessage: async (teacherId: number, content: string, studentId?: number) => {
    const response = await api.post('/parents/messages/send', {
      teacher_id: teacherId,
      content,
      student_id: studentId
    });
    return response.data;
  },
  markMessageAsRead: async (messageId: number) => {
    const response = await api.put(`/parents/messages/${messageId}/read`);
    return response.data;
  },
  // Results
  getResults: async () => {
    const response = await api.get('/parents/results');
    return response.data;
  },
  // Assignments
  getAssignments: async () => {
    const response = await api.get('/parents/assignments');
    return response.data;
  },
  // Timetable
  getTimetable: async () => {
    const response = await api.get('/parents/timetable');
    return response.data;
  },
};

// Teacher API
export const teacherApi = {
  getDashboard: async () => {
    const response = await api.get('/teachers/dashboard');
    return response.data;
  },
  getClasses: async () => {
    const response = await api.get('/teachers/classes');
    return response.data;
  },
  getMyClasses: async () => {
    const response = await api.get('/teachers/my-classes');
    return response.data;
  },
  getMySubjects: async () => {
    const response = await api.get('/teachers/my-subjects');
    return response.data;
  },
  // Profile
  getProfile: async () => {
    const response = await api.get('/teachers/profile');
    return response.data;
  },
  updateProfile: async (data: { phone?: string; address?: string }) => {
    const response = await api.put('/teachers/profile', null, { params: data });
    return response.data;
  },
  // Timetable
  getTimetable: async () => {
    const response = await api.get('/teachers/timetable');
    return response.data;
  },
  // Assignments
  getAssignments: async () => {
    const response = await api.get('/teachers/assignments');
    return response.data;
  },
  createAssignment: async (data: any) => {
    const response = await api.post('/teachers/assignments', data);
    return response.data;
  },
  deleteAssignment: async (id: number) => {
    const response = await api.delete(`/teachers/assignments/${id}`);
    return response.data;
  },
  getAssignmentSubmissions: async (assignmentId: number) => {
    const response = await api.get(`/teachers/assignments/${assignmentId}/submissions`);
    return response.data;
  },
  gradeSubmission: async (submissionId: number, marks: number, feedback?: string) => {
    const response = await api.put(`/teachers/submissions/${submissionId}/grade`, null, {
      params: { marks_obtained: marks, feedback }
    });
    return response.data;
  },
  // Attendance
  markAttendance: async (data: any) => {
    const response = await api.post('/teachers/attendance', data);
    return response.data;
  },
  getClassAttendance: async (classId: number, date: string) => {
    const response = await api.get(`/teachers/attendance/${classId}/${date}`);
    return response.data;
  },
  // Exams & Marks
  getExams: async () => {
    const response = await api.get('/teachers/exams');
    return response.data;
  },
  getExamStudents: async (examId: number, classId?: number) => {
    const response = await api.get(`/teachers/exam/${examId}/students`, { params: { class_id: classId } });
    return response.data;
  },
  enterMarks: async (examId: number, subjectId: number, results: any[]) => {
    const response = await api.post('/teachers/marks', {
      exam_id: examId,
      subject_id: subjectId,
      results: results
    });
    return response.data;
  },
  // Notices
  getNotices: async () => {
    const response = await api.get('/teachers/notices');
    return response.data;
  },
  // Messages
  getParentsForMessaging: async () => {
    const response = await api.get('/teachers/messages/parents');
    return response.data;
  },
  getConversationWithParent: async (parentId: number) => {
    const response = await api.get(`/teachers/messages/parent/${parentId}`);
    return response.data;
  },
  sendMessageToParent: async (parentId: number, content: string, studentId?: number) => {
    const response = await api.post('/teachers/messages/send', null, {
      params: { parent_id: parentId, content, student_id: studentId }
    });
    return response.data;
  },
  markTeacherMessageAsRead: async (messageId: number) => {
    const response = await api.put(`/teachers/messages/${messageId}/read`);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  // Students
  getStudents: async (params?: { class_id?: number; skip?: number; limit?: number }) => {
    const response = await api.get('/admin/students', { params });
    return response.data;
  },
  createStudent: async (data: any) => {
    const response = await api.post('/admin/students', data);
    return response.data;
  },
  updateStudent: async (id: number, data: any) => {
    const response = await api.put(`/admin/students/${id}`, data);
    return response.data;
  },
  deleteStudent: async (id: number) => {
    const response = await api.delete(`/admin/students/${id}`);
    return response.data;
  },
  // Teachers
  getTeachers: async () => {
    const response = await api.get('/admin/teachers');
    return response.data;
  },
  createTeacher: async (data: any) => {
    const response = await api.post('/admin/teachers', data);
    return response.data;
  },
  updateTeacher: async (id: number, data: any) => {
    const response = await api.put(`/admin/teachers/${id}`, data);
    return response.data;
  },
  deleteTeacher: async (id: number) => {
    const response = await api.delete(`/admin/teachers/${id}`);
    return response.data;
  },
  // Classes
  getClasses: async () => {
    const response = await api.get('/admin/classes');
    return response.data;
  },
  createClass: async (data: any) => {
    const response = await api.post('/admin/classes', data);
    return response.data;
  },
  // Fees
  getFees: async (status?: string) => {
    const response = await api.get('/admin/fees', { params: { status } });
    return response.data;
  },
  createFee: async (data: any) => {
    const response = await api.post('/admin/fees', data);
    return response.data;
  },
  createBulkFees: async (data: any) => {
    const response = await api.post('/admin/fees/bulk', data);
    return response.data;
  },
  // Admissions
  getAdmissions: async (status?: string) => {
    const response = await api.get('/admin/admissions', { params: { status } });
    return response.data;
  },
  updateAdmission: async (id: number, data: any) => {
    const response = await api.put(`/admin/admissions/${id}`, data);
    return response.data;
  },
  // Notices
  getNotices: async () => {
    const response = await api.get('/admin/notices');
    return response.data;
  },
  createNotice: async (data: any) => {
    const response = await api.post('/admin/notices', data);
    return response.data;
  },
  updateNotice: async (id: number, data: any) => {
    const response = await api.put(`/admin/notices/${id}`, data);
    return response.data;
  },
  deleteNotice: async (id: number) => {
    const response = await api.delete(`/admin/notices/${id}`);
    return response.data;
  },
  // Attendance
  getAttendance: async (params?: { class_id?: number; attendance_date?: string }) => {
    const response = await api.get('/admin/attendance', { params });
    return response.data;
  },
  getClassAttendance: async (classId: number, date: string) => {
    const response = await api.get(`/admin/attendance/class/${classId}/date/${date}`);
    return response.data;
  },
  markBulkAttendance: async (data: { date: string; class_id: number; records: any[] }) => {
    const response = await api.post('/admin/attendance/bulk', data);
    return response.data;
  },
  getStudentAttendanceSummary: async (studentId: number, params?: { start_date?: string; end_date?: string }) => {
    const response = await api.get(`/admin/attendance/summary/${studentId}`, { params });
    return response.data;
  },
  // Timetable
  getClassTimetable: async (classId: number) => {
    const response = await api.get(`/admin/timetable/class/${classId}`);
    return response.data;
  },
  createTimetableEntry: async (data: any) => {
    const response = await api.post('/admin/timetable', data);
    return response.data;
  },
  updateTimetableEntry: async (entryId: number, data: any) => {
    const response = await api.put(`/admin/timetable/${entryId}`, data);
    return response.data;
  },
  deleteTimetableEntry: async (entryId: number) => {
    const response = await api.delete(`/admin/timetable/${entryId}`);
    return response.data;
  },
  // Exams
  getExams: async () => {
    const response = await api.get('/admin/exams');
    return response.data;
  },
  createExam: async (data: any) => {
    const response = await api.post('/admin/exams', data);
    return response.data;
  },
  getExam: async (id: number) => {
    const response = await api.get(`/admin/exams/${id}`);
    return response.data;
  },
  updateExam: async (id: number, data: any) => {
    const response = await api.put(`/admin/exams/${id}`, data);
    return response.data;
  },
  deleteExam: async (id: number) => {
    const response = await api.delete(`/admin/exams/${id}`);
    return response.data;
  },
  // Exam Schedules
  getExamSchedules: async (examId: number) => {
    const response = await api.get(`/admin/exams/${examId}/schedules`);
    return response.data;
  },
  createExamSchedule: async (examId: number, data: any) => {
    const response = await api.post(`/admin/exams/${examId}/schedules`, data);
    return response.data;
  },
  deleteExamSchedule: async (scheduleId: number) => {
    const response = await api.delete(`/admin/exams/schedules/${scheduleId}`);
    return response.data;
  },
  // Exam Results
  getExamResults: async (examId: number, params?: { class_id?: number; subject_id?: number }) => {
    const response = await api.get(`/admin/exams/${examId}/results`, { params });
    return response.data;
  },
  addBulkResults: async (data: { exam_id: number; subject_id: number; results: any[] }) => {
    const response = await api.post('/admin/exams/results/bulk', data);
    return response.data;
  },
  // Admin Users
  getAdmins: async () => {
    const response = await api.get('/admin/admins');
    return response.data;
  },
  createAdmin: async (data: { email: string; password: string; name: string; phone?: string; designation?: string }) => {
    const response = await api.post('/admin/admins', null, { params: data });
    return response.data;
  },
  deleteAdmin: async (id: number) => {
    const response = await api.delete(`/admin/admins/${id}`);
    return response.data;
  },
  // Subjects
  getSubjects: async () => {
    const response = await api.get('/admin/subjects');
    return response.data;
  },
};

// Admission API (public)
export const admissionApi = {
  submitInquiry: async (data: any) => {
    const response = await api.post('/admissions/inquiry', data);
    return response.data;
  },
  submitApplication: async (data: any) => {
    const response = await api.post('/admissions/apply', data);
    return response.data;
  },
  checkStatus: async (id: number) => {
    const response = await api.get(`/admissions/status/${id}`);
    return response.data;
  },
};

// AI API
export const aiApi = {
  chat: async (message: string, history?: any[]) => {
    const response = await api.post('/ai/chat', { message, history });
    return response.data;
  },
  generateQuestions: async (data: any) => {
    const response = await api.post('/ai/generate-questions', data);
    return response.data;
  },
};

// Payment API
export const paymentApi = {
  createOrder: async (feeId: number, amount: number) => {
    const response = await api.post('/payments/create-order', { fee_id: feeId, amount });
    return response.data;
  },
  verifyPayment: async (orderId: string, paymentId: string, signature: string, feeId: number) => {
    const response = await api.post('/payments/verify', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      fee_id: feeId,
    });
    return response.data;
  },
  getPaymentStatus: async (feeId: number) => {
    const response = await api.get(`/payments/status/${feeId}`);
    return response.data;
  },
};

export default api;
