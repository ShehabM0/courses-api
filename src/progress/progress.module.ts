import { ProgressController } from './progress.controller';
import { CourseModule } from 'src/courses/course.module';
import { ProgressService } from './progress.service';
import { TokenModule } from 'src/token/token.module';
import { UserModule } from 'src/users/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './progress.entity';
import { Module } from '@nestjs/common';
import { EnrollmentModule } from 'src/enrollments/enrollments.module';
import { LessonModule } from 'src/lessons/lesson.module';

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
