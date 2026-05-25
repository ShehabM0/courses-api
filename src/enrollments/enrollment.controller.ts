import { Controller, Post, Request, UseGuards } from "@nestjs/common";
import { EnrollmentService } from "./enrollment.service";
import { AuthGuard } from "src/auth/auth.guard";

@Controller('enrollments')
export class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) {}

  @UseGuards(AuthGuard)
  @Post(':courseId')
  create(@Request() req, courseId: string) {
    const userId: string = req.user.uid;
    return this.enrollmentService.enroll(userId, courseId);
  }
}
