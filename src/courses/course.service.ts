import { CategoryService } from "src/categories/category.service";
import { Category } from "src/categories/category.entity";
import { UserService } from "src/users/user.service";
import { SafeUser } from "src/users/user.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { CoursePaginationDTO, CreateCourseDTO } from "./course.dto";
import { Injectable } from "@nestjs/common";
import { Course, CourseStatus } from "./course.entity";
import { Brackets, Repository } from "typeorm";
import { PagePaginationDTO } from "src/common/pagination/pagination.dto";

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
    const categories: Category[] = await this.categoryService.findByIds(categoryIds);

    const instructor: SafeUser = await this.userService.findById(instructorId);

    const course: Course = this.courseRepository.create({
      ...createCourseDTO,
      thumbnail: thumbnailPath,
      instructor,
      categories,
    });

    return this.courseRepository.save(course);
  }

  async findAll(coursePaginationDTO: CoursePaginationDTO) {
    const page = coursePaginationDTO.page ?? 1;
    const pageSize = coursePaginationDTO.pageSize ?? 10;
    const query = coursePaginationDTO.query?.trim().toLowerCase() ?? '';

    const { categorySlug, minPrice, maxPrice } = coursePaginationDTO;

    const q = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.categories', 'category')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .where('course.status = :status', { status: CourseStatus.PUBLISHED });
    
    if(query) {
      q.andWhere(
        new Brackets((qb) => {
          qb.where('course.title ILIKE :query', { query: `%${query}%` })
            .orWhere('course.description ILIKE :query', { query: `%${query}%` })
            .orWhere('instructor.name ILIKE :query', { query: `%${query}%` })
            .orWhere('category.slug ILIKE :query', { query: `%${query}%` });
        }),
      );
    }

    if(categorySlug) {
      q.andWhere('category.slug ILIKE :categorySlug', { categorySlug: `%${categorySlug}%` });
    }

    if(minPrice !== undefined) {
      q.andWhere('course.price >= :minPrice', { minPrice });
    }

    if(maxPrice !== undefined) {
      q.andWhere('course.price <= :maxPrice', { maxPrice });
    }

    const [courses, totalItems] = await q
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: courses,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    }
  }
}
