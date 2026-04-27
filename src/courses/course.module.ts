import { CategoryModule } from 'src/categories/category.module';
import { UserModule } from 'src/users/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSeed } from './course.seed';
import { Course } from './course.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    CategoryModule,
    UserModule,
  ],
  providers: [CourseSeed],
  exports: [CourseSeed],
})
export class CourseModule {}
