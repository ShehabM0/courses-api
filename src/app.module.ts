import { ConfigModule, ConfigService } from '@nestjs/config';
import { RevokedToken } from './token/token.entity';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: true,
        entities: [User, RevokedToken],
        synchronize: config.get<string>('NODE_ENV') === 'DEV',
      }),
    }),

    RedisModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
