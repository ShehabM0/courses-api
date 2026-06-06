import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { EnrollGuard } from "src/enrollments/enrollment.guard";
import { RolesGuard } from "src/roles/roles.guard";
import { Roles } from "src/roles/roles.decorator";
import { ReviewService } from "./review.service";
import { UserRole } from "src/users/user.entity";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateReviewDTO } from "./review.dto";

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
}
