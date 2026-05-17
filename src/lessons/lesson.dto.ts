import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

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
