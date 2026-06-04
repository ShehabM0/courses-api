import { EnrollmentModule } from "src/enrollments/enrollments.module";
import { CourseModule } from "src/courses/course.module";
import { ReviewController } from "./review.controller";
import { TokenModule } from "src/token/token.module";
import { UserModule } from "src/users/user.module";
import { AuthModule } from "src/auth/auth.module";
import { ReviewService } from "./review.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./review.entity";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    EnrollmentModule,
    CourseModule,
    TokenModule,
    AuthModule,
    UserModule,
  ],
  providers: [ReviewService],
  controllers: [ReviewController]
})
export class ReviewModule {}
