import { Enrollment } from './enrollment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
  ],
})
export class EnrollmentModule {}
