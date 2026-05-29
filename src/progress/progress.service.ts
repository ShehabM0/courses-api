import { EnrollmentService } from "src/enrollments/enrollment.service";
import { Enrollment } from "src/enrollments/enrollment.entity";
import { CourseProgressResponse } from "./progress.interface";
import { LessonService } from "src/lessons/lesson.service";
import { Lesson } from "src/lessons/lesson.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Progress } from "./progress.entity";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
    private readonly enrollmentService: EnrollmentService,
    private readonly lessonService: LessonService
  ) {}

  async markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<{ message: string }> {
    const enrollment: Enrollment = await this.enrollmentService.findById(userId, courseId);
    const lesson: Lesson = await this.lessonService.findById(courseId, lessonId);

    let progress: Progress | null = await this.progressRepository.findOne({
      where: { 
        enrollment: { id: enrollment.id },
        lesson: { id: lesson.id }
      }
    });
    if(!progress) {
      progress = this.progressRepository.create({
        enrollment,
        lesson,
        isCompleted: true,
        completedAt: new Date()
      });
    } else {
      if(progress.isCompleted)
        return { message: 'Lesson already marked as completed!' };
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }
    await this.progressRepository.save(progress);

    await this.makeCourseCompelete(enrollment);

    return { message: 'Lesson marked as completed.' };
  }

  async makeCourseCompelete(enrollment: Enrollment): Promise<void> {
    if(enrollment.isCompleted)
        return;

    const totalLessons: number = await this.lessonService.count(enrollment.course.id);
    const completedLessons: number = await this.progressRepository.count({
      where: { 
        enrollment: { id: enrollment.id },
        isCompleted: true
      }
    });

    if(completedLessons == totalLessons)
      await this.enrollmentService.makeCourseCompelete(enrollment);
  }

  async getProgress(userId: string, courseId: string): Promise<CourseProgressResponse> {
    const enrollment: Enrollment = await this.enrollmentService.findById(userId, courseId);
    const totalLessons: number = await this.lessonService.count(enrollment.course.id);
    const completedLessons: number = await this.progressRepository.count({
      where: { 
        enrollment: { id: enrollment.id },
        isCompleted: true
      }
    });

    const percentage =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    return {
      progress: {
        totalLessons,
        completedLessons,
        percentage,
        progress: enrollment.progress
      },

      completion: {
        isCompleted: enrollment.isCompleted,
        completedAt: enrollment.completedAt
      }
    };
  }
}
