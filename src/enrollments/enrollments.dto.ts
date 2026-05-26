import { PagePaginationDTO } from 'src/common/pagination/pagination.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from "class-transformer";

export class EnrollmentPaginationDTO extends PagePaginationDTO {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  courseCompleted?: boolean;
}
