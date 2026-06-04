import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./review.entity";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
  ],
})
export class ReviewModule {}
