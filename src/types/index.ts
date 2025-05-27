
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  studentId?: string;
  branch?: string;
  semester?: number;
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
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  semester: number;
  branch: string;
  status: 'pending' | 'submitted' | 'overdue';
}

export interface Attendance {
  id: string;
  studentId: string;
  subject: string;
  date: string;
  status: 'present' | 'absent';
  qrCode?: string;
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
