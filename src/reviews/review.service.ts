import { ConflictException, Injectable } from "@nestjs/common";
import { CourseService } from "src/courses/course.service";
import { UserService } from "src/users/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Course } from "src/courses/course.entity";
import { CreateReviewDTO } from "./review.dto";
import { User } from "src/users/user.entity";
import { Review } from "./review.entity";
import { Repository } from "typeorm";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly courseService: CourseService,
    private readonly userService: UserService,
  ) {}

  // EnrollGuard
  async create(courseId: string, userId: string, createReviewDTO: CreateReviewDTO): Promise<Review> {
    let review: Review | null = await this.reviewRepository.findOneBy({
      user: { id: userId },
      course: { id: courseId }
    });
    if (review)
      throw new ConflictException('You have already reviewed this course!');

    const course: Course = await this.courseService.findById(courseId);
    const user: User = await this.userService.findById(userId);
    review = this.reviewRepository.create({ ...createReviewDTO, user, course});
    await this.reviewRepository.save(review);

    await this.updateCourseRating(courseId);

    return review;
  }

  // Helper

  async updateCourseRating(courseId: string): Promise<void> {
    const reviewsSum: number = await this.reviewRepository.sum(
      'rating',
      { course: { id: courseId } }
    ) ?? 0;
    const totalReviews: number = await this.reviewRepository.countBy({ course: { id: courseId }});

    const averageRating = totalReviews > 0 ? reviewsSum / totalReviews : 0;
    await this.courseService.updateRating(courseId, totalReviews, averageRating);
  }
}
