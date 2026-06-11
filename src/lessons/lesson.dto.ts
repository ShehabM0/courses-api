import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { Type } from 'class-transformer';

export class CreateLessonDTO {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsNumber()
  @Min(0)
  duration!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  order!: number;

  @IsBoolean()
  isFree!: boolean;
}

export class UpdateLessonDTO extends PartialType(CreateLessonDTO) {}

export class OrderLessonDTO {
  @IsUUID('4')
  id!: string;

  @IsNumber()
  @Min(1)
  order!: number;
}
export class OrderLessonsDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLessonDTO)
  lessons!: OrderLessonDTO[];
}
