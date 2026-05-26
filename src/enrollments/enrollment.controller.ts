import { Controller, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { PagePaginationDTO } from "src/common/pagination/pagination.dto";
import { EnrollmentPaginationDTO } from "./enrollments.dto";
import { EnrollmentService } from "./enrollment.service";
import { RolesGuard } from "src/roles/roles.guard";
import { Roles } from "src/roles/roles.decorator";
import { UserRole } from "src/users/user.entity";
import { AuthGuard } from "src/auth/auth.guard";

@Controller('enrollments')
export class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post(':courseId')
  create(@Request() req, @Param('courseId') courseId: string) {
    const userId: string = req.user.uid;
    return this.enrollmentService.enroll(userId, courseId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get('my-courses')
  getMyEnrollments(@Request() req, @Query() pagePaginationDTO: PagePaginationDTO) {
    const userId: string = req.user.uid;
    return this.enrollmentService.myEnrollments(userId, pagePaginationDTO);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Get(':courseId/students')
  getCourseStudents(
    @Request() req,
    @Param('courseId') coruseId: string,
    @Query() enrollmentPaginationDTO: EnrollmentPaginationDTO
  ) {
    const instructorId: string = req.user.uid;
    return this.enrollmentService.courseStudents(instructorId, coruseId, enrollmentPaginationDTO);
  }
}
