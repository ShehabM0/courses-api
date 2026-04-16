import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/user.module';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from "ms";

@Module({
  imports: [
    forwardRef(() => UserModule), // Wrap with forwardRef

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
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
