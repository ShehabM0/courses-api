import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PagePaginatedResult } from "src/common/pagination/pagination.interface";
import { PagePaginationDTO } from "src/common/pagination/pagination.dto";
import { CreateReviewDTO, UpdateReviewDTO } from "./review.dto";
import { CourseService } from "src/courses/course.service";
import { UserService } from "src/users/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Course } from "src/courses/course.entity";
import { DeleteResult } from "typeorm/browser";
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

  async update(id: string, courseId: string, userId: string, updateReviewDTO: UpdateReviewDTO): Promise<Review> {
    const review: Review = await this.find(id, courseId);
    if(review.user.id != userId)
      throw new ForbiddenException('You can only edit your own review!');

    Object.assign(review, updateReviewDTO);
    await this.reviewRepository.save(review);

    if(updateReviewDTO.rating)
      await this.updateCourseRating(courseId);

    return review;
  }

  async delete(id: string, courseId: string, userId: string): Promise<{ deleted: boolean }> {
    const review: Review = await this.find(id, courseId);
    if(review.user.id != userId)
      throw new ForbiddenException('You can only edit your own review!');
    
    const del: DeleteResult = await this.reviewRepository.delete(review.id);

    if(del.affected === 1)
      await this.updateCourseRating(courseId);
    
    return { deleted: del.affected === 1 };
  }

  async findAll(courseId: string, pagePaginationDTO: PagePaginationDTO): Promise<PagePaginatedResult<Review>> {
    const page = pagePaginationDTO.page ?? 1;
    const pageSize = pagePaginationDTO.pageSize ?? 10;

    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .select('review')
      .addSelect(['user.id', 'user.name'])
      .where('review.courseId = :courseId', { courseId });
    
    const [reviews, totalItems] = await query
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);
      
    return {
      data: reviews,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    }
  }

  // Helper

  async find(id: string, courseId: string): Promise<Review> {
    const review: Review | null = await this.reviewRepository.findOne({
      where: { id, course: { id: courseId } },
      relations: ['user']
    });
    if(!review)
      throw new NotFoundException('Review not found!');
    return review;
  }

  async updateCourseRating(courseId: string): Promise<void> {
    const { avg, count } = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.courseId = :courseId', { courseId })
      .getRawOne();
    
    const totalReviews: number = parseInt(count, 10);
    const averageRating: number = totalReviews > 0 ? parseFloat(avg ?? '0') : 0;

    await this.courseService.updateRating(courseId, totalReviews, averageRating);
  }
}
