import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { LessonService } from './lesson.service';
import { UserRole } from 'src/users/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateLessonDTO } from './lesson.dto';

@Controller('courses/:courseId/lessons')
export class LessonController {
  constructor(private lessonService: LessonService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Post('')
  create(
    @Param('courseId') courseId: string,
    @Request() req,
    @Body() createLessonDTO: CreateLessonDTO
  ) {
    const instructorId: string = req.user.uid;
    return this.lessonService.create(courseId, instructorId, createLessonDTO);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Post('bulk')
  createMany(
    @Param('courseId') courseId: string,
    @Request() req,
    @Body() createLessonDTO: CreateLessonDTO[]
  ) {
    const instructorId: string = req.user.uid;
    return this.lessonService.createMany(courseId, instructorId, createLessonDTO);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Delete(':lessonId')
  delete(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Request() req,
  ) {
    const instructorId: string = req.user.uid;
    return this.lessonService.delete(lessonId, courseId, instructorId);
  }
}
