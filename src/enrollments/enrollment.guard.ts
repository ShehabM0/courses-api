import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';

@Injectable()
export class EnrollGuard implements CanActivate {
  constructor(private enrollmentService: EnrollmentService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const courseId = request.params.courseId;
    const userId   = request.user.id;

    const isEnrolled = await this.enrollmentService.isEnrolled(userId, courseId);
    if (!isEnrolled)
      throw new ForbiddenException('You are not enrolled in this course!');

    return true;
  }
}
