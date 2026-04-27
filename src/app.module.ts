import { CategoryModule } from './categories/category.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Category } from './categories/category.entity';
import { CourseModule } from './courses/course.module';
import { RevokedToken } from './token/token.entity';
import { RedisModule } from './redis/redis.module';
import { Course } from './courses/course.entity';
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
        entities: [
          User, RevokedToken,
          Course, Category
        ],
        synchronize: config.get<string>('NODE_ENV') === 'DEV',
      }),
    }),

    CategoryModule,
    CourseModule,
    RedisModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
