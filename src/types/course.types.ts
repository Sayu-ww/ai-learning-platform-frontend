export interface Course {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  isAiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  videoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  lastPosition: number;
  completedAt?: Date;
  updatedAt: Date;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  videoId?: string;
}
