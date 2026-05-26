import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { PagePaginatedResult } from "src/common/pagination/pagination.interface";
import { PagePaginationDTO } from "src/common/pagination/pagination.dto";
import { Course, CourseStatus } from "src/courses/course.entity";
import { EnrollmentPaginationDTO } from "./enrollments.dto";
import { CourseService } from "src/courses/course.service";
import { UserService } from "src/users/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Enrollment } from "./enrollment.entity";
import { Brackets, Repository } from "typeorm";
import { User } from "src/users/user.entity";

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly courseService: CourseService,
    private readonly userService: UserService,
  ) {}

  async enroll(userId: string, courseId: string): Promise<Enrollment> {
    const course: Course = await this.courseService.findById(courseId);
    if (course.status !== CourseStatus.PUBLISHED)
      throw new BadRequestException('Course is not available yet!');

    const user: User = await this.userService.findById(userId);

    // double check @Unique(['user', 'course'])
    const enrolled: Enrollment | null = await this.enrollmentRepository.findOneBy({
      course: { id: courseId },
      user: { id: userId }
    });
    if(enrolled)
      throw new ConflictException("User already enrolled to this course!");

    if(Number(course.price) !== 0) {
      // TODO: Payment.
    }

    const enrollment: Enrollment = this.enrollmentRepository.create({ course, user });
    return this.enrollmentRepository.save(enrollment);
  }

  async myEnrollments(userId: string, pagePaginationDTO: PagePaginationDTO): Promise<PagePaginatedResult<Enrollment>> {
    const page = pagePaginationDTO.page ?? 1;
    const pageSize = pagePaginationDTO.pageSize ?? 10;

    const [enrollments, totalItems]: [Enrollment[], number] = await this.enrollmentRepository.findAndCount({
      where: {
        user: { id: userId },
      },
      relations: ['course', 'course.categories', 'progress'],
      order: { enrolledAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: enrollments,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async courseStudents(instructorId: string, courseId: string, enrollmentPaginationDTO: EnrollmentPaginationDTO): Promise<PagePaginatedResult<Enrollment>> {
    await this.courseService.getOwnedCourse(courseId, instructorId);

    const page = enrollmentPaginationDTO.page ?? 1;
    const pageSize = enrollmentPaginationDTO.pageSize ?? 10;
    const query = enrollmentPaginationDTO.query?.trim().toLowerCase() ?? '';
    const courseCompleted = enrollmentPaginationDTO.courseCompleted;

    const q = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.user', 'user')
      .leftJoin('enrollment.course', 'course')
      .where('course.id = :courseId', { courseId });

    if(query) {
      q.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :query', { query: `%${query}%` })
           .orWhere('user.email ILIKE :query', { query: `%${query}%` })
        }),
      );
    }
    if (courseCompleted !== undefined) {
      q.andWhere('enrollment.isCompleted = :courseCompleted', { courseCompleted });
    }

    const [enrollments, totalItems] = await q
      .orderBy('enrollment.enrolledAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);
    
    return {
      data: enrollments,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  // Helper

  async isEnrolled(userId: string, courseId: string): Promise<Boolean> {
    const enrolled: Enrollment | null = await this.enrollmentRepository.findOneBy({
      course: { id: courseId },
      user: { id: userId }
    });
    return enrolled != null;
  }
}
