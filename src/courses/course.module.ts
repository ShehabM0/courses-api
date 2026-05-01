import { CategoryModule } from 'src/categories/category.module';
import { CourseController } from './course.controller';
import { TokenModule } from 'src/token/token.module';
import { UserModule } from 'src/users/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { CourseService } from './course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSeed } from './course.seed';
import { Course } from './course.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    CategoryModule,
    TokenModule,
    UserModule,
    AuthModule
  ],
  providers: [CourseSeed, CourseService],
  controllers: [CourseController],
  exports: [CourseSeed, CourseService],
})
export class CourseModule {}
