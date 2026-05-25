import { ConflictException, Injectable } from "@nestjs/common";
import { CourseService } from "src/courses/course.service";
import { UserService } from "src/users/user.service";
import { Course } from "src/courses/course.entity";
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

  async enroll(userId: string, courseId: string) {
    const course: Course = await this.courseService.findById(courseId);
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
}
