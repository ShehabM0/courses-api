import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";

export class CreateReviewDTO {
  @IsString()
  @IsOptional()
  comment?: string

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number
}

export class UpdateReviewDTO extends PartialType(CreateReviewDTO) {}
