import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './progress.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Progress]),
  ],
})
export class ProgressModule {}
