import {  BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateLessonDTO, OrderLessonDTO, UpdateLessonDTO } from "./lesson.dto";
import { MoreThan, MoreThanOrEqual, Repository } from "typeorm";
import { CourseService } from "src/courses/course.service";
import { Course } from "src/courses/course.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRole } from "src/users/user.entity";
import { DeleteResult } from "typeorm/browser";
import { Lesson } from "./lesson.entity";

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly courseService: CourseService,
  ) {}

  async findAll(courseId: string, userId: string, userRole: UserRole): Promise<Lesson[]> {
    let lessons: Lesson[];
    if(userRole === UserRole.INSTRUCTOR) {
      await this.courseService.getOwnedCourse(courseId, userId);
      lessons = await this.lessonRepository.findBy({ course: { id: courseId }});
    } else {
      lessons = await this.lessonRepository.findBy({
        course: { id: courseId },
        isFree: false
      });
    }
    return lessons;
  }

  async findById(lessonId: string): Promise<Lesson> {
    const lesson: Lesson | null = await this.lessonRepository.findOneBy({ id: lessonId });
    if(!lesson)
      throw new NotFoundException('Lesson not found!');
    return lesson;
  }

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

  async createMany(courseId: string, instructorId: string, createLessonDTO: CreateLessonDTO[]): Promise<Lesson[]> {
    return await this.lessonRepository.manager.transaction(async manager => {
      let lessons: Lesson[] = [];
      for(const lessonDTO of createLessonDTO) {
        const newLesson: Lesson = await this.create(courseId, instructorId, lessonDTO);
        lessons.push(newLesson);
      }
      return lessons;
    });
  }

  async update(
    lessonId: string,
    courseId: string,
    instructorId: string,
    updateLessonDTO: UpdateLessonDTO
  ): Promise<Lesson> {
    await this.courseService.getOwnedCourse(courseId, instructorId);

    const lesson: Lesson = await this.findById(lessonId);

    Object.assign(lesson, updateLessonDTO);
    return this.lessonRepository.save(lesson);
  }

  async delete(lessonId: string, courseId: string, instructorId: string): Promise<{ deleted: boolean }> {
    await this.courseService.getOwnedCourse(courseId, instructorId);

    const lesson: Lesson = await this.findById(lessonId);

    return await this.lessonRepository.manager.transaction(async manager => {
      const lessonsToShift: Lesson[] = await manager.find(Lesson, {
        where: { course: { id: courseId }, order: MoreThan(lesson.order) },
        order: { order: 'ASC' },
      });

      for (const lesson of lessonsToShift)
        await manager.update(Lesson, { id: lesson.id }, { order: lesson.order - 1 });

      const del: DeleteResult = await this.lessonRepository.delete(lesson.id);
      return { deleted: del.affected === 1 };
    })
  }

  async reorder(courseId: string, instructorId: string, orderLessonsDTO: OrderLessonDTO[]): Promise<Lesson[]> {
    await this.courseService.getOwnedCourse(courseId, instructorId);

    const courseLessonsCount: number =
      await this.lessonRepository.countBy({course: { id: courseId }});
    if(courseLessonsCount !== orderLessonsDTO.length)
      throw new BadRequestException(
        'The submitted lessons list is incomplete. All course lessons must be included.'
      );

    await this.lessonRepository.manager.transaction(async manager => {
      for(const lesson of orderLessonsDTO)
        await manager.update(Lesson, { id: lesson.id }, { order: lesson.order });
    });

    const lessons: Lesson[] = await this.lessonRepository.find({
      where: { course: { id: courseId } },
      order: { order: 'ASC' }
    });
    return lessons;
  }
}
