import { TokenModule } from 'src/token/token.module';
import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserSeed } from './user.seed';
import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    TokenModule,
  ],
  controllers: [UserController],
  providers: [UserSeed, UserService],
  exports: [UserSeed, UserService],
})
export class UserModule {}
