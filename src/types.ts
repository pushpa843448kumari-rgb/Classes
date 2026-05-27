export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin';
  name: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: string;
}
