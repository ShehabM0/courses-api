import { CategoryController } from './category.controller';
import { TokenModule } from 'src/token/token.module';
import { CategoryService } from './category.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorySeed } from './category.seed';
import { Category } from './category.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    AuthModule,
    TokenModule,
  ],
  providers: [CategorySeed, CategoryService],
  controllers: [CategoryController],
  exports: [CategorySeed, CategoryService],
})
export class CategoryModule {}
