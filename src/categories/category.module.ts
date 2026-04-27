import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorySeed } from './category.seed';
import { Category } from './category.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
  ],
  providers: [CategorySeed, CategoryService],
  exports: [CategorySeed, CategoryService],
})
export class CategoryModule {}
