import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { CourseModule } from 'src/courses/course.module';
import { TokenModule } from 'src/token/token.module';
import { UserModule } from 'src/users/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { Enrollment } from './enrollment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    CourseModule,
    TokenModule,
    UserModule,
    AuthModule
  ],
  providers: [EnrollmentService],
  controllers: [EnrollmentController],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
