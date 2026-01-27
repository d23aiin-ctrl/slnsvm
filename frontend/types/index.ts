export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Student {
  id: number;
  user_id: number;
  admission_no: string;
  name: string;
  class_id?: number;
  section?: string;
  roll_no?: number;
  dob?: string;
  gender?: string;
  address?: string;
  phone?: string;
  parent_id?: number;
  blood_group?: string;
  profile_image?: string;
  created_at: string;
}

export interface Parent {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  email?: string;
  occupation?: string;
  address?: string;
  relation?: string;
  created_at: string;
}

export interface Teacher {
  id: number;
  user_id: number;
  employee_id: string;
  name: string;
  phone?: string;
  qualification?: string;
  experience_years?: number;
  join_date?: string;
  address?: string;
  profile_image?: string;
  created_at: string;
}

export interface Class {
  id: number;
  name: string;
  section?: string;
  academic_year: string;
  class_teacher_id?: number;
  room_number?: string;
  created_at: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  class_id?: number;
  description?: string;
  created_at: string;
}

export interface TimetableEntry {
  id: number;
  day: string;
  period: number;
  start_time?: string;
  end_time?: string;
  subject_name?: string;
  teacher_name?: string;
  room?: string;
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  due_date: string;
  attachment_url?: string;
  max_marks?: number;
  class_name?: string;
  subject_name?: string;
  teacher_name?: string;
  created_at: string;
}

export interface AttendanceSummary {
  total_days: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface Fee {
  id: number;
  student_id: number;
  student_name?: string;
  amount: number;
  fee_type: string;
  description?: string;
  due_date: string;
  paid_date?: string;
  paid_amount?: number;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';
  payment_method?: string;
  transaction_id?: string;
  receipt_number?: string;
  academic_year?: string;
  created_at: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  target_role?: UserRole;
  priority: string;
  is_active: boolean;
  attachment_url?: string;
  created_by?: number;
  created_at: string;
  expires_at?: string;
}

export interface Admission {
  id: number;
  student_name: string;
  dob: string;
  gender?: string;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  address?: string;
  class_applied: string;
  previous_school?: string;
  previous_class?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  remarks?: string;
  created_at: string;
}

export interface StudentDashboard {
  student: Student;
  attendance_percentage: number;
  pending_assignments: number;
  upcoming_exams: number;
  fee_pending: number;
  recent_notices: { id: number; title: string; priority: string }[];
}

export interface ParentDashboard {
  parent: Parent;
  children: ChildInfo[];
  total_fee_pending: number;
  recent_notices: { id: number; title: string; priority: string }[];
}

export interface ChildInfo {
  id: number;
  name: string;
  admission_no: string;
  class_name?: string;
  section?: string;
  roll_no?: number;
  attendance_percentage: number;
  fee_status: string;
}

export interface TeacherDashboard {
  teacher: Teacher;
  classes: ClassInfo[];
  total_students: number;
  pending_assignments_to_grade: number;
  today_schedule: ScheduleEntry[];
  recent_notices: { id: number; title: string; priority: string }[];
}

export interface ClassInfo {
  id: number;
  name: string;
  section?: string;
  total_students: number;
}

export interface ScheduleEntry {
  period: number;
  class: string;
  subject: string;
  room?: string;
}

export interface AdminDashboard {
  total_students: number;
  total_teachers: number;
  total_parents: number;
  total_classes: number;
  pending_admissions: number;
  total_fee_collected: number;
  total_fee_pending: number;
  recent_admissions: Admission[];
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  suggestions?: string[];
}
