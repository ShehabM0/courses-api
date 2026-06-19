import { NestExpressApplication } from '@nestjs/platform-express';
import { CategorySeed } from './categories/category.seed';
import { CourseSeed } from './courses/course.seed';
import { ValidationPipe } from '@nestjs/common';
import { UserSeed } from './users/user.seed';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useStaticAssets('uploads');
  await app.listen(process.env.PORT ?? 3000);

  // Seed
  // const userSeed = app.get(UserSeed);
  // await userSeed.seed();

  // const categorySeed = app.get(CategorySeed);
  // await categorySeed.seed();

  // const courseSeed = app.get(CourseSeed);
  // await courseSeed.seed();
}
bootstrap();
