export type UserRole = 'student' | 'admin' | 'faculty';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: number;
  branch?: string;
  semester?: number;
  specialization?: string;
  facultyId?: number;
  department?: string;
  designation?: string;
}

export interface Timetable {
  id: string;
  day: string;
  time: string;
  subject: string;
  faculty: string;
  room: string;
  semester: number;
  branch: string;
}

export interface Assignment {
  id: number;
  title: string;
  subject: string;
  description: string;
  semester: number;
  branch: string;
  specialization?: string;
  due_date: string;
  faculty_id?: number;
  status?: number;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  file_url?: string;
  text_answer?: string;
  submitted_at: string;
  status: string;
}

export interface Attendance {
  id: number;
  student_id: number;
  date: string;
  status: string;
  time_in?: string;
  time_out?: string;
  subject: string;
  faculty_id?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'urgent' | 'exam' | 'event';
  date: string;
  isRead: boolean;
}

export interface Syllabus {
  id: string;
  subject: string;
  semester: number;
  branch: string;
  pdfUrl: string;
  uploadDate: string;
}
