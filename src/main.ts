import { NestExpressApplication } from '@nestjs/platform-express';
import { CategorySeed } from './categories/category.seed';
import { CourseSeed } from './courses/course.seed';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useStaticAssets('uploads');
  await app.listen(process.env.PORT ?? 3000);

  // Seed
  // const categorySeed = app.get(CategorySeed);
  // await categorySeed.seed();

  // const courseSeed = app.get(CourseSeed);
  // await courseSeed.seed();
}
bootstrap();
