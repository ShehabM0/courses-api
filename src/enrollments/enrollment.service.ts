import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { Course, CourseStatus } from "src/courses/course.entity";
import { CourseService } from "src/courses/course.service";
import { UserService } from "src/users/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Enrollment } from "./enrollment.entity";
import { User } from "src/users/user.entity";
import { Repository } from "typeorm";

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

  // Helper

  async isEnrolled(userId: string, courseId: string): Promise<Boolean> {
    const enrolled: Enrollment | null = await this.enrollmentRepository.findOneBy({
      course: { id: courseId },
      user: { id: userId }
    });
    return enrolled != null;
  }
}
