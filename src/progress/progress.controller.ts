import { Controller, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ProgressService } from "./progress.service";
import { RolesGuard } from "src/roles/roles.guard";
import { Roles } from "src/roles/roles.decorator";
import { UserRole } from "src/users/user.entity";
import { AuthGuard } from "src/auth/auth.guard";

@Controller('progress/:courseId')
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post('lessons/:lessonId/complete')
  completeLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Request() req,
  ) {
    const userId: string = req.user.uid;
    return this.progressService.markLessonComplete(userId, courseId, lessonId);
  }
}
