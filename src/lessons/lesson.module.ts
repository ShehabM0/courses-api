import { EnrollmentModule } from 'src/enrollments/enrollments.module';
import { CourseModule } from 'src/courses/course.module';
import { LessonController } from './lesson.controller';
import { TokenModule } from 'src/token/token.module';
import { UserModule } from 'src/users/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { LessonService } from './lesson.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './lesson.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson]),
    EnrollmentModule,
    CourseModule,
    TokenModule,
    UserModule,
    AuthModule
  ],
  providers: [LessonService],
  controllers: [LessonController],
})
export class LessonModule {}
