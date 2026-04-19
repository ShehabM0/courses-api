import { IsBoolean, IsEmail, IsOptional } from "class-validator";

export class UpdateUserDTO {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
