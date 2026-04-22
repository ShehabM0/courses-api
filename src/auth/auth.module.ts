import { VerificationModule } from 'src/verification/verification.module';
import { TokenModule } from 'src/token/token.module';
import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from '../users/user.module';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from "ms";

@Module({
  imports: [
    forwardRef(() => UserModule),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<StringValue>('JWT_ACCESS_TOKEN')!,
        signOptions: {
          expiresIn: config.get<StringValue>('JWT_ACCESS_TOKEN_EXP_TIME')!,
        },
      }),
    }),

    VerificationModule,
    TokenModule,
    MailModule,
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
