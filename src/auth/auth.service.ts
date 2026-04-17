import { Inject, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { LoggedUser, SafeUser } from 'src/users/user.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserService } from '../users/user.service';
import { User} from 'src/users/user.entity';
import type { Cache } from 'cache-manager';
import { Tokens } from './auth.interface';
import { JwtService } from '@nestjs/jwt';
import { SignUpDTO } from "./auth.dto";
import type { StringValue } from "ms";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly redisClient: Cache,
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

  async logout(accessToken: string): Promise<{message: string}> {
    await this.revokeToken(accessToken);
    return { message: "Logged out successfully" };
  }

  async refresh(refreshToken: string): Promise<Tokens> {
    try {
      const payload = await this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN,
      });

      const revokedToken: boolean = await this.isTokenRevoked(refreshToken);
      if(revokedToken)
        throw new UnauthorizedException('Refresh token revoked!');
      await this.revokeToken(refreshToken);

      const uid: string = payload.id;
      const user: SafeUser = await this.userService.findById(uid);

      const tokens: Tokens = await this.generateTokens(user);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token!');
    }
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

  async revokeToken(token: string): Promise<void> {
    try {
      await this.redisClient.set(
        token,
        'revoked',
        parseInt(process.env.JWT_SECRET_TOKEN_EXP_TIME || '1', 10)
        * 86400
      );
    } catch (error) {
      throw new UnprocessableEntityException('Error revoking access token!');
    }
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    try {
      const result: string | undefined = await this.redisClient.get(token);
      return result === 'revoked';
    } catch (error) {
      throw new UnprocessableEntityException('Error checking token revocation!');
    }
  }
}
