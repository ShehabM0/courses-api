import { Controller, Param, Post, Request, UseGuards } from "@nestjs/common";
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
}
