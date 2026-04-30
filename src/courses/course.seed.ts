import { PaginatedResult } from 'src/common/pagination.interface';
import { CategoryService } from 'src/categories/category.service';
import { Category } from 'src/categories/category.entity';
import { Course, CourseStatus } from './course.entity';
import { UserService } from 'src/users/user.service';
import { SafeUser } from 'src/users/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';

@Injectable()
export class CourseSeed {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private categoryService: CategoryService,
    private userService: UserService
  ) {}

  async seed() {
    const addedCourses = 20;
    const instructors: SafeUser[] = await this.userService.findAllInstructors();
    const categories: PaginatedResult<Category> = await this.categoryService.findAll({limit: undefined, offset:undefined});

    for (let i = 0; i < addedCourses; i++) {
      const randomInstructor: SafeUser =
        instructors[Math.floor(Math.random() * instructors.length)];

      const randomCategories: Category[] = faker.helpers.arrayElements(
        categories.data,
        faker.number.int({ min: 1, max: 3 }),
      );

      const course = this.courseRepository.create({
        instructor: randomInstructor,
        title: faker.company.catchPhrase(),
        description: faker.lorem.paragraphs(2),
        price: Number(faker.commerce.price({ min: 10, max: 200 })),
        thumbnail: faker.image.urlPicsumPhotos(),
        status: faker.helpers.arrayElement([
          CourseStatus.DRAFT,
          CourseStatus.PUBLISHED,
        ]),
        categories: randomCategories,
      });

      await this.courseRepository.save(course);
    }

    const totalCategories: number = await this.courseRepository.count();
    console.log("----------Course Seed------------");
    console.log("Courses seeded: " + addedCourses);
    console.log("Total Courses: " + totalCategories);
    console.log("---------------------------------");
  }
}
