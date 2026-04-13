import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoggedUser, SafeUser } from 'src/users/user.interface'
import { UserService } from '../users/user.service';
import { User} from 'src/users/user.entity';
import { Tokens } from './auth.interface';
import { JwtService } from '@nestjs/jwt';
import { SignUpDTO } from "./auth.dto";
import type { StringValue } from "ms";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async signUp(user: SignUpDTO): Promise<SafeUser> {
    const newUser: User = new User();
    Object.assign(newUser, user);
    newUser.password = await bcrypt.hash(user.password, 10);

    const createdUser: SafeUser = await this.userService.create(newUser);
    return createdUser;
  }

  async signIn(email: string, pass: string): Promise<LoggedUser> {
    // throws if not exists
    const user: SafeUser = await this.userService.findByEmail(email);
    const verify: boolean = await this.userService.verifyPass(user.id, pass);
    if(!verify)
      throw new UnauthorizedException("That email and password combination didn't work!");

    const tokens: Tokens = await this.generateTokens(user);

    return { ...user, ...tokens };
  }

  async generateTokens(user: SafeUser): Promise<Tokens> {
    const payload = { id: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_TOKEN! as StringValue,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXP_TIME! as StringValue,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_TOKEN! as StringValue,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXP_TIME! as StringValue,
    });
    return { accessToken, refreshToken };
  }
}
