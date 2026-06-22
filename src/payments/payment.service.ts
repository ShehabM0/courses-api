import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PagePaginatedResult } from "src/common/pagination/pagination.interface";
import { EnrollmentService } from "src/enrollments/enrollment.service";
import { Session } from "node_modules/stripe/cjs/resources/Checkout";
import { Course, CourseStatus } from "src/courses/course.entity";
import { CourseService } from "src/courses/course.service";
import type { StripeWebhookEvent } from "./stripe.service";
import { Payment, PaymentStatus } from "./payment.entity";
import { User, UserRole } from "src/users/user.entity";
import { PaymentPaginationDTO } from "./payments.dto";
import { UserService } from "src/users/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { StripeService } from "./stripe.service";
import { Brackets, Repository } from "typeorm";
import type { Checkout } from 'stripe';

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
      Race condition [x] ---database level protection--> [v]
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
    if (pendingPayment) {
      const session: Session = await this.stripeService.stripe.checkout.sessions.retrieve(
        pendingPayment.stripeSessionId!
      );

      if (session.status !== 'expired') {
        return {
          message: 'Payment already in progress!',
          sessionUrl: session.url
        };
      }
      await this.paymentRepository.update(
        { id: pendingPayment.id },
        { status: PaymentStatus.EXPIRED }
      );
    }

    const session: Session = await this.stripeService.createCheckoutSession({
      courseId,
      userId,
      courseTitle: course.title,
      amount: course.price,
      currency: 'usd'
    });

    const payment: Payment = this.paymentRepository.create({
      user,
      course,
      amount: course.price,
      currency: 'usd',
      status: PaymentStatus.PENDING,
      stripeSessionId: session.id
    });
    await this.paymentRepository.save(payment);

    return {
      message: 'Checkout session created successfully.',
      sessionUrl: session.url
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

  async find(userId: string, userRole: UserRole, paymentPaginationDTO: PaymentPaginationDTO)
  :Promise<PagePaginatedResult<Payment>> {
    const page = paymentPaginationDTO.page ?? 1;
    const pageSize = paymentPaginationDTO.pageSize ?? 10;
    const status = paymentPaginationDTO.status as PaymentStatus | undefined;
    const query = paymentPaginationDTO.query?.trim();

    const qb = this.paymentRepository
    .createQueryBuilder('payment')
    .leftJoinAndSelect('payment.course', 'course')
    .leftJoinAndSelect('payment.user', 'user');

    if(userRole == UserRole.STUDENT) {
      qb.where('user.id = :userId', { userId });
    } else if(query) {
      qb.where(
        new Brackets((qb) => {
          qb.where('user.email ILIKE :search', { search: `%${query}%` })
            .orWhere('user.name ILIKE :search', { search: `%${query}%` });
        })
      );
    }

    if (status) {
      qb.andWhere('payment.status = :status', { status });
    }

    const [payments, totalItems] : [Payment[], number] = await qb
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: payments,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
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
        stripePaymentId: session.payment_intent as string
      }
    );

    await this.enrollmentService.enroll(userId, courseId);
  }

  private async handlePaymentFailed(session: Checkout.Session): Promise<void> {
    await this.paymentRepository.update(
      { stripeSessionId: session.id },
      { status: PaymentStatus.FAILED }
    );
  }
}
