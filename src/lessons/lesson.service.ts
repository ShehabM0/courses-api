import { CourseService } from "src/courses/course.service";
import { MoreThanOrEqual, Repository } from "typeorm";
import { Course } from "src/courses/course.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateLessonDTO } from "./lesson.dto";
import {  Injectable } from "@nestjs/common";
import { Lesson } from "./lesson.entity";

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly courseService: CourseService,
  ) {}

  async create(courseId: string, instructorId: string, createLessonDTO: CreateLessonDTO): Promise<Lesson> {
    const course: Course = await this.courseService.getOwnedCourse(courseId, instructorId);

    return await this.lessonRepository.manager.transaction(async manager => {
      const lastLesson: Lesson | null = await manager.findOne(Lesson, {
        where: { course: { id: courseId } },
        order: { order: 'DESC' }
      });

      const nextOrder: number = lastLesson? lastLesson.order + 1 : 1;
      const order: number = createLessonDTO.order ? Math.min(createLessonDTO.order, nextOrder) : nextOrder;

      const lessonsToShift: Lesson[] = await manager.find(Lesson, {
        where: { course: { id: courseId }, order: MoreThanOrEqual(order) },
        order: { order: 'DESC' },
      });

      for (const lesson of lessonsToShift)
        await manager.update(Lesson, { id: lesson.id }, { order: lesson.order + 1 });

      const newLesson: Lesson = manager.create(Lesson, { ...createLessonDTO, order, course });
      return await manager.save(newLesson);
    });
  }
}
