import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { PagePaginationDTO } from "src/common/pagination/pagination.dto";
import { EnrollGuard } from "src/enrollments/enrollment.guard";
import { RolesGuard } from "src/roles/roles.guard";
import { Roles } from "src/roles/roles.decorator";
import { ReviewService } from "./review.service";
import { UserRole } from "src/users/user.entity";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateReviewDTO, UpdateReviewDTO } from "./review.dto";

@Controller('courses/:courseId/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(AuthGuard, RolesGuard, EnrollGuard)
  @Roles(UserRole.STUDENT)
  @Post('')
  create(
    @Request() req,
    @Param('courseId') courseId: string,
    @Body() createReviewDTO: CreateReviewDTO
  ) {
    const userId: string = req.user.uid;
    return this.reviewService.create(courseId, userId,createReviewDTO);
  }

  @UseGuards(AuthGuard, RolesGuard, EnrollGuard)
  @Roles(UserRole.STUDENT)
  @Patch(':reviewId')
  update(
    @Request() req,
    @Param('courseId') courseId: string,
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDTO: UpdateReviewDTO
  ) {
    const userId: string = req.user.uid;
    return this.reviewService.update(reviewId, courseId, userId, updateReviewDTO);
  }

  @Get('')
  get(@Param('courseId') courseId: string, @Query() pagePaginationDTO: PagePaginationDTO) {
    return this.reviewService.findAll(courseId, pagePaginationDTO);
  }
}
