import { EnrollmentModule } from 'src/enrollments/enrollments.module';
import { ProgressController } from './progress.controller';
import { LessonModule } from 'src/lessons/lesson.module';
import { CourseModule } from 'src/courses/course.module';
import { ProgressService } from './progress.service';
import { TokenModule } from 'src/token/token.module';
import { UserModule } from 'src/users/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './progress.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Progress]),
    EnrollmentModule,
    LessonModule,
    CourseModule,
    TokenModule,
    UserModule,
    AuthModule
  ],
  providers: [ProgressService],
  controllers: [ProgressController],
})
export class ProgressModule {}
