import { BadRequestException, Controller, Get, Headers, Param, Post, Query, type RawBodyRequest, Request, UseGuards } from "@nestjs/common";
import { PaymentPaginationDTO } from "./payments.dto";
import { RolesGuard } from "src/roles/roles.guard";
import { PaymentService } from "./payment.service";
import { Roles } from "src/roles/roles.decorator";
import { UserRole } from "src/users/user.entity";
import { AuthGuard } from "src/auth/auth.guard";

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post('checkout/:courseId')
  create(@Request() req, @Param('courseId') courseId: string) {
    const userId: string = req.user.uid;
    return this.paymentService.createCheckoutSession(userId, courseId);
  }

  /*
    stripe listen --forward-to localhost:3000/payments/webhook
    stripe trigger checkout.session.completed
  */
  @Post('webhook')
  async handleWebhook(
    @Request() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody)
      throw new BadRequestException('Raw body is missing');
    return this.paymentService.handleWebhook(req.rawBody, signature);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Get('')
  myPayments(@Request() req, @Query() paymnetPaginationDTO: PaymentPaginationDTO) {
    const userId: string = req.user.uid;
    const userRole: UserRole = req.user.role;
    return this.paymentService.find(userId, userRole, paymnetPaginationDTO);
  }
}
