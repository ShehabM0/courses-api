import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';
import { CacheModule } from '@nestjs/cache-manager';
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
        entities: [User],
        synchronize: config.get<string>('NODE_ENV') === 'DEV',
      }),
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          url: config.get<string>('REDIS_URL'),
        }),
      }),
    }),

    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
