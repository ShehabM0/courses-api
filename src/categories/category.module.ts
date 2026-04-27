import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
  ],
})
export class CategoryModule {}
