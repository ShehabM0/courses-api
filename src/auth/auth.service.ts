import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { VerificationService } from 'src/verification/verification.service';
import { RefreshTokenDTO, ResetPasswordDTO, SignUpDTO, VerifyEmailDTO } from "./auth.dto";
import { LoggedUser, SafeUser } from 'src/users/user.interface';
import { TokenService } from 'src/token/token.service';
import { UserService } from '../users/user.service';
import { EmailType } from 'src/mail/mail.type';
import { User} from 'src/users/user.entity';
import { Tokens } from './auth.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private verificationService: VerificationService,
    private tokenService: TokenService,
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async signUp(user: SignUpDTO): Promise<{ message: string }> {
    const newUser: User = new User();
    Object.assign(newUser, user);
    newUser.password = await bcrypt.hash(user.password, 10);

    await this.userService.create(newUser);
    await this.verificationService.sendVerificationCode(user.email, EmailType.VERIFY_EMAIL);

    return { message: 'Verification code sent to your email.' };
  }

  async signIn(email: string, pass: string): Promise<LoggedUser> {
    // throws if not exists
    const user: SafeUser = await this.userService.findByEmail(email);
    const verifyPass: boolean = await this.userService.verifyPass(user.id, pass);
    if(!verifyPass)
      throw new UnauthorizedException("That email and password combination didn't work!");

    if(!user.isVerified) {
      await this.verificationService.sendVerificationCode(email, EmailType.VERIFY_EMAIL);
      throw new UnauthorizedException('Email not verified, check your email!');
    }

    const tokens: Tokens = await this.tokenService.generateTokens(user);

    return { ...user, ...tokens };
  }

  async logout(accessToken: string): Promise<{message: string}> {
    // await this.revokeToken(accessToken);
    const payload = await this.jwtService.verifyAsync(accessToken); // sec

    const expiresAt = new Date(payload.exp * 1000); // ms
    const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000); // sec

    return { message: "Logged out successfully." };
  }

  async refresh(refreshTokenDTO: RefreshTokenDTO): Promise<Tokens> {
    const { userId, refreshToken } = refreshTokenDTO;
    try {
      const payload = await this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN,
      });

      const revokedToken: boolean = await this.tokenService.isTokenRevoked(userId, refreshToken);
      if(revokedToken)
        throw new UnauthorizedException('Refresh token revoked!');
      await this.tokenService.revokeToken(userId, refreshToken);

      const uid: string = payload.id;
      const user: SafeUser = await this.userService.findById(uid);

      const tokens: Tokens = await this.tokenService.generateTokens(user);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token!');
    }
  }

  async verifyEmail(verifyEmailDTO: VerifyEmailDTO): Promise<{message: string}> {
    const { email, code } = verifyEmailDTO;
    const user = await this.userService.findByEmail(email);

    if (user.isVerified)
      throw new BadRequestException('Email already verified!');

    const verifyCode: boolean =
      await this.verificationService.verifyVerificationCode(email, code);
    if (!verifyCode)
      throw new BadRequestException('Invalid verification code!');

    await this.userService.update(user.id, { isVerified: true });

    return { message: 'Email verified.' };
  }

  async forgotPassword(email: string): Promise<{message: string}> {
    try { // not found user catch without exposure or mailing
      await this.userService.findByEmail(email);
      await this.verificationService.sendVerificationCode(email, EmailType.RESET_PASSWORD);
    } catch (error) {}

    return { message: 'If the account exists, a reset code has been sent.' };
  }

  async resetPassword(resetPasswordDTO: ResetPasswordDTO): Promise<{message: string}> {
    const { email, password, code } = resetPasswordDTO;

    const verifyCode: boolean =
      await this.verificationService.verifyVerificationCode(email, code);
    if (!verifyCode)
      throw new BadRequestException('Invalid verification code!');

    const user: SafeUser = await this.userService.findByEmail(email);
    await this.userService.update(user.id, { password: password});

    await this.tokenService.revokeAllTokens(user.id);

    return { message: 'Password has been reset.' };
  }
}
