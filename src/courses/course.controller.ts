import { Body, Controller, Get, Param, Patch, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CoursePaginationDTO, CreateCourseDTO, UpdateCourseDTO } from './course.dto';
import { multerOptions } from '../common/config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import { CourseService } from './course.service';
import { AuthGuard } from 'src/auth/auth.guard';

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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Get('my-courses')
  getMyCourses(@Request() req) {
    const instructorId: string = req.user.uid;
    return this.courseService.findMine(instructorId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  find(@Param('id') id: string) {
    return this.courseService.findById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('thumbnail', multerOptions))
  update(
    @Param('id') id: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateCourseDTO: UpdateCourseDTO
  ) {
    const instructorId: string = req.user.uid;
    return this.courseService.update(id, instructorId, updateCourseDTO, file);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Patch(':id/publish')
  publish(@Param('id') id: string, @Request() req) {
    const instructorId: string = req.user.uid;
    return this.courseService.publish(id, instructorId);
  }
}
