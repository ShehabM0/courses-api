import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDTO {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class UpdateUserPassDTO {
  @IsNotEmpty()
  @IsString()
  oldPassword!: string;

  @IsNotEmpty()
  @IsString()
  newPassword!: string;
}
