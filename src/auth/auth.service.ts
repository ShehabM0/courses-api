import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserDAO } from 'src/users/user.entity';
import { UserService } from '../users/user.service';
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

  async signUp(user: SignUpDTO): Promise<UserDAO> {
    const newUser: User = new User();
    Object.assign(newUser, user);
    newUser.password = await bcrypt.hash(user.password, 10);

    const createdUser: UserDAO = await this.userService.create(newUser);
    return createdUser;
  }

  async signIn(email: string, pass: string): Promise<{ 
    access_token: string, refresh_token: string
  }> {
    // throws if not exists
    const user: UserDAO = await this.userService.findByEmail(email);
    const verify: boolean = await this.userService.verifyPass(user.id, pass);
    if(!verify)
      throw new UnauthorizedException();

    const tokens = await this.generateTokens(user);

    return { access_token: tokens.accessToken, refresh_token: tokens.refreshToken };
  }

  async generateTokens(user: UserDAO): Promise<{ 
    accessToken: string, refreshToken: string
  }> {
    const payload = { sub: user.id, email: user.email };
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
