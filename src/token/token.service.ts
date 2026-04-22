import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SafeUser } from 'src/users/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Tokens } from 'src/auth/auth.interface';
import { LessThan, Repository } from 'typeorm';
import { RevokedToken } from "./token.entity";
import type { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';

// Fast lookups via Redis
// Persistence across server restarts via DB
@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(RevokedToken)
    private revokedTokenRepository: Repository<RevokedToken>,
    @Inject(CACHE_MANAGER) private readonly redisClient: Cache,
    private jwtService: JwtService
  ) {}

  async generateTokens(user: SafeUser): Promise<Tokens> {
    const payload = { uid: user.id, email: user.email };
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

  async revokeToken(userId: string, token: string): Promise<void> {
    const payload = await this.jwtService.verifyAsync(token); // sec
    if(!payload)
      throw new UnauthorizedException('Invalid token!');

    const expiresAt: Date = new Date(payload.exp * 1000); // ms
    const ttl: number = Math.floor((expiresAt.getTime() - Date.now()) / 1000); // sec
    // expired
    if (ttl <= 0) return;

    await this.redisClient.set(token, 'revoked', ttl * 1000);
    await this.revokedTokenRepository.upsert({ token, userId, expiresAt }, ['token']);
    // INSERT ... ON CONFLICT DO UPDATE/ON DUPLICATE KEY UPDATE.
  }

  async revokeAllTokens(userId: string): Promise<void> {
    const revokedAt = Math.floor(Date.now() / 1000);
    const ttl = 60 * 60 * 24 * 7; // 7 days
    await this.redisClient.set(`revoked_all:${userId}`, revokedAt.toString(), ttl * 86400);
  
    await this.revokedTokenRepository.update({ userId }, { revokedAt });
  }

  async isTokenRevoked(userId: string, token: string): Promise<boolean> {
    const result: string | undefined = await this.redisClient.get(token);
    if(result === 'revoked')
      return true;
    const revokedAllAt = await this.redisClient.get(`revoked_all:${userId}`);
    if(revokedAllAt) {
      const payload = await this.jwtService.verifyAsync(token);
      if(payload?.iat < revokedAllAt)
        return true;
    }
    
    const revokedToken: RevokedToken | null =
      await this.revokedTokenRepository.findOne({ where: { token } });
    if(revokedToken) {
      const ttl: number = Math.floor((revokedToken.expiresAt.getTime() - Date.now()) / 1000);
      // future faster lookup.
      await this.redisClient.set(token, 'revoked', ttl * 1000);
      return true;
    }

    return false;
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.revokedTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
