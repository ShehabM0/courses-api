import { PagePaginationDTO } from 'src/common/pagination/pagination.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from './payment.entity';

export class PaymentPaginationDTO extends PagePaginationDTO {
  @IsEnum(PaymentStatus)
  @IsOptional()
  @IsString()
  status?: string;
}
