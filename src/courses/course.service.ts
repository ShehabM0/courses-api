import { CategoryService } from "src/categories/category.service";
import { Category } from "src/categories/category.entity";
import { UserService } from "src/users/user.service";
import { SafeUser } from "src/users/user.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCourseDTO } from "./course.dto";
import { Injectable } from "@nestjs/common";
import { Course } from "./course.entity";
import { Repository } from "typeorm";

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly categoryService: CategoryService,
    private readonly userService: UserService
  ) {}

  async create(
    instructorId: string,
    createCourseDTO: CreateCourseDTO,
    file?: Express.Multer.File,
  ): Promise<Course> {
    const thumbnailPath: string | undefined = file ? `/uploads/${file.filename}` : undefined;

    const categoryIds: string[] = createCourseDTO?.categoryIds ?? [];
    const categories: Category[] = [];
    for(const categoryId of categoryIds) {
      const category: Category | null = await this.categoryService.findById(categoryId);
      if(category)
        categories.push(category);
    }

    const instructor: SafeUser = await this.userService.findById(instructorId);

    const course: Course = this.courseRepository.create({
      ...createCourseDTO,
      thumbnail: thumbnailPath,
      instructor,
      categories,
    });

    return this.courseRepository.save(course);
  }
}
