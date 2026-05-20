import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { CreateLessonDTO, OrderLessonsDTO, UpdateLessonDTO } from './lesson.dto';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { LessonService } from './lesson.service';
import { UserRole } from 'src/users/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('courses/:courseId/lessons')
export class LessonController {
  constructor(private lessonService: LessonService) {}

  @UseGuards(AuthGuard)
  @Get('')
  findAll(
    @Param('courseId') courseId: string,
    @Request() req
  ) {
    const userId: string = req.user.uid;
    const userRole: UserRole = req.user.role;
    return this.lessonService.findAll(courseId, userId, userRole);
  }

  // TODO: Enroll
  @UseGuards(AuthGuard)
  @Get(':lessonId')
  find(@Param('lessonId') lessonId: string) {
    return this.lessonService.findById(lessonId);
  }

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
  @Patch('reorder')
  reorder(
    @Param('courseId') courseId: string,
    @Request() req,
    @Body() orderLessonsDTO: OrderLessonsDTO,
  ) {
    const instructorId: string = req.user.uid;
    return this.lessonService.reorder(courseId, instructorId, orderLessonsDTO.lessons);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Patch(':lessonId')
  update(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Request() req,
    @Body() updateLessonDTO: UpdateLessonDTO
  ) {
    const instructorId: string = req.user.uid;
    return this.lessonService.update(lessonId, courseId, instructorId, updateLessonDTO);
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
