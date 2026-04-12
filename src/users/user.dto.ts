import { IsEmail, IsOptional, IsString, } from "class-validator";

export class UpdateUserDTO {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  verify?: boolean;
}
