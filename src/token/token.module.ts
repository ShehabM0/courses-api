import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from './token.service';
import { RevokedToken } from './token.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([RevokedToken]),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}

