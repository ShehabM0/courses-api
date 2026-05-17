import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { LessonService } from './lesson.service';
import { UserRole } from 'src/users/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateLessonDTO } from './lesson.dto';

@Controller('lessons')
export class LessonController {
  constructor(private lessonService: LessonService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Post(':courseId')
  create(
    @Param('courseId') courseId: string,
    @Request() req,
    @Body() createLessonDTO: CreateLessonDTO
  ) {
    const instructorId: string = req.user.uid;
    return this.lessonService.create(courseId, instructorId, createLessonDTO);
  }
}
