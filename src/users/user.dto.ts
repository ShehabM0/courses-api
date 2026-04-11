import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { UserRole } from "./user.entity";

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export class CreateUserDTO {
  @IsNotEmpty()
  @IsEmail(undefined, { message: 'Please provide valid Email.' })
  email!: string;

  @IsNotEmpty()
  @IsString()
  // @Matches(passwordRegEx, {
  //   message: `Password must contain Minimum 8 and maximum 20 characters, 
  //   at least one uppercase letter, 
  //   one lowercase letter, 
  //   one number and 
  //   one special character.`,
  // })
  password!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsString()
  @IsEnum(UserRole)
  role!: string;
}

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
