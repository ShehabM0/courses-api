import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
  ],
})
export class CourseModule {}
