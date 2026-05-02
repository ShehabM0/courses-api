import { Body, Controller, Get, Param, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { multerOptions } from '../common/config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import { CourseService } from './course.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CoursePaginationDTO, CreateCourseDTO } from './course.dto';

@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Post('')
  @UseInterceptors(FileInterceptor('thumbnail', multerOptions))
  create(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() createCourseDTO: CreateCourseDTO
  ) {
    const instructorId: string = req.user.uid;
    return this.courseService.create(instructorId, createCourseDTO, file);
  }

  @UseGuards(AuthGuard)
  @Get('')
  findAll(@Query() coursePaginationDTO: CoursePaginationDTO) {
    return this.courseService.findAll(coursePaginationDTO);
  }
}
