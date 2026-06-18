import { EnrollmentModule } from './enrollments/enrollments.module';
import { CategoryModule } from './categories/category.module';
import { Enrollment } from './enrollments/enrollment.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProgressModule } from './progress/progress.module';
import { PaymentModule } from './payments/payment.module';
import { Category } from './categories/category.entity';
import { ReviewModule } from './reviews/review.module';
import { CourseModule } from './courses/course.module';
import { LessonModule } from './lessons/lesson.module';
import { Progress } from './progress/progress.entity';
import { RevokedToken } from './token/token.entity';
import { Payment } from './payments/payment.entity';
import { RedisModule } from './redis/redis.module';
import { Lesson } from './lessons/lesson.entity';
import { Course } from './courses/course.entity';
import { UserModule } from './users/user.module';
import { Review } from './reviews/review.entity';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: true,
        entities: [
          User, RevokedToken,
          Course, Category, Lesson,
          Enrollment, Progress, Review,
          Payment
        ],
        synchronize: config.get<string>('NODE_ENV') === 'DEV',
      }),
    }),

    EnrollmentModule,
    ProgressModule,
    CategoryModule,
    PaymentModule,
    CourseModule,
    ReviewModule,
    LessonModule,
    RedisModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
