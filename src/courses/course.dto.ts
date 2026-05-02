import { Transform, Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { PagePaginationDTO } from "src/common/pagination/pagination.dto";

export class CreateCourseDTO {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[]
}

export class CoursePaginationDTO extends PagePaginationDTO {
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxPrice?: number;
}
