import { EnrollmentModule } from 'src/enrollments/enrollments.module';
import { PaymentController } from './payment.controller';
import { CourseModule } from 'src/courses/course.module';
import { TokenModule } from 'src/token/token.module';
import { UserModule } from 'src/users/user.module';
import { PaymentService } from './payment.service';
import { AuthModule } from 'src/auth/auth.module';
import { StripeService } from './stripe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    EnrollmentModule,
    CourseModule,
    TokenModule,
    UserModule,
    AuthModule
  ],
  providers: [PaymentService, StripeService],
  controllers: [PaymentController],
})
export class PaymentModule {}
