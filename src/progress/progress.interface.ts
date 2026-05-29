import { Progress } from "./progress.entity";

export interface CourseProgressResponse {
  progress: {
    totalLessons: number;
    completedLessons: number;
    percentage: number;
    progress: Progress[];
  };

  completion: {
    isCompleted: boolean;
    completedAt: Date | undefined;
  };
}
