import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { EnrollmentService } from "src/enrollments/enrollment.service";
import { Session } from "node_modules/stripe/cjs/resources/Checkout";
import { Course, CourseStatus } from "src/courses/course.entity";
import { CourseService } from "src/courses/course.service";
import type { StripeWebhookEvent } from "./stripe.service";
import { Payment, PaymentStatus } from "./payment.entity";
import { UserService } from "src/users/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { StripeService } from "./stripe.service";
import { User } from "src/users/user.entity";
import type { Checkout } from 'stripe';
import { Repository } from "typeorm";

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private enrollmentService: EnrollmentService,
    private courseService: CourseService,
    private stripeService: StripeService,
    private userService: UserService
  ) {}

  async createCheckoutSession(userId: string, courseId: string):
    Promise<{message: string, sessionUrl: string | null}> {
    const user: User = await this.userService.findById(userId);
    const course: Course = await this.courseService.findById(courseId);

    const isEnrolled: Boolean = await this.enrollmentService.isEnrolled(userId, courseId);
    if(isEnrolled)
      throw new ConflictException('User Already enrolled in this course!');

    if (course.status !== CourseStatus.PUBLISHED)
      throw new BadRequestException('Course is not available yet!');

    if(course.price === 0) {
      await this.enrollmentService.enroll(userId, courseId);
      return {
        message: 'Enrolled successfully (free course).',
        sessionUrl: null
      };
    }

    /*
      Prevent duplicate processing [v]
      Race condition [x]
      CREATE UNIQUE INDEX unique_pending_payment
      ON payments(user_id, course_id)
      WHERE status = 'PENDING';
    */
    const pendingPayment: Payment | null = await this.paymentRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
        status: PaymentStatus.PENDING
      }
    });
    /*
      [x] Unhandled case [x]
      User clicks Buy
      Payment record created (PENDING)
      Stripe Checkout Session created
      User closes tab
      User comes back tomorrow
      Clicks Buy again
      Existing PENDING payment found
      "Payment already in progress!"
    */
    if (pendingPayment)
      throw new ConflictException('Payment already in progress!');

    const session: Session = await this.stripeService.createCheckoutSession({
      courseId,
      userId,
      courseTitle: course.title,
      amount: course.price,
      currency: 'usd',
    });
    
    const payment = this.paymentRepository.create({
      user,
      course,
      amount: course.price,
      currency: 'usd',
      status: PaymentStatus.PENDING,
      stripeSessionId: session.id,
    });
    await this.paymentRepository.save(payment);

    return {
      message: 'Checkout session created successfully.',
      sessionUrl: session.url,
    };
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    let event: StripeWebhookEvent
    try {
      event = this.stripeService.constructWebhookEvent(payload, signature);
    } catch {
      throw new BadRequestException('Invalid webhook signature!');
    }

    const eventType: string = event.type;
    if(eventType === 'checkout.session.completed') {
      await this.handlePaymentSuccess(event.data.object as Checkout.Session);
    }
    else if(eventType === 'checkout.session.expired') {
      await this.handlePaymentFailed(event.data.object as Checkout.Session);
    }
  }

  // Helper

  private async handlePaymentSuccess(session: Checkout.Session): Promise<void> {
    if (!session.metadata)
      throw new NotFoundException('Session metadata is missing!');
    const { courseId, userId } = session.metadata;

    await this.paymentRepository.update(
      { stripeSessionId: session.id },
      {
        status: PaymentStatus.COMPLETED,
        stripePaymentId: session.payment_intent as string,
      }
    );

    await this.enrollmentService.enroll(userId, courseId);
  }

  private async handlePaymentFailed(session: Checkout.Session): Promise<void> {
    await this.paymentRepository.update(
      { stripeSessionId: session.id },
      { status: PaymentStatus.FAILED },
    );
  }
}
