export interface User {
  id: number;
  username: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
  subject: string;
  avatar: string;
}

export interface Result {
  id: number;
  studentId: number;
  teacherId: number;
  subject: string;
  taskName: string;
  marks: number;
  totalMarks: number;
  status: 'completed' | 'pending' | 'notcompleted';
  locked: boolean;
  screenshot: string;
  studentSubmission: string;
  submissionType: 'pdf' | 'jpg' | 'text' | '';
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}