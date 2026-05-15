import { CoursePaginationDTO, CreateCourseDTO, UpdateCourseDTO } from "./course.dto";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CategoryService } from "src/categories/category.service";
import { Category } from "src/categories/category.entity";
import { Course, CourseStatus } from "./course.entity";
import { UserService } from "src/users/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { User } from "src/users/user.entity";
import { DeleteResult } from "typeorm/browser";

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

    const instructor: User = await this.userService.findById(instructorId);

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

  async findById(id: string): Promise<Course> {
    const course: Course | null = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor', 'categories']
    });

    if (!course)
      throw new NotFoundException('Course not found!');

    return course;
  }

  async findMine(instructorId: string): Promise<Course[]> {
    const instructorCourses = await this.courseRepository.find({
      where: {
        instructor: { id: instructorId }
      },
      relations: ['categories']
    })

    return instructorCourses;
  }

  async publish(id: string, instructorId: string): Promise<Course> {
    const course: Course = await this.findById(id);

    if(course.instructor.id !== instructorId)
      throw new ForbiddenException('You do not own this course!');
    
    course.status = CourseStatus.PUBLISHED;
    const publishedCourse: Course = await this.courseRepository.save(course);

    return publishedCourse;
  }

  async update(
    id: string,
    instructorId: string,
    updateCourseDTO: UpdateCourseDTO, 
    file?: Express.Multer.File,
  ): Promise<Course> {
    const thumbnailPath: string | undefined = file ? `/uploads/${file.filename}` : undefined;
    const course: Course = await this.findById(id);

    if(course.instructor.id !== instructorId)
      throw new ForbiddenException('You do not own this course!');
    
    if(updateCourseDTO.categoryIds) {
      const categories: Category[] = await this.categoryService.findByIds(updateCourseDTO.categoryIds);
      course.categories = categories;
    }
    updateCourseDTO.thumbnail = thumbnailPath;
    Object.assign(course, updateCourseDTO);

    return this.courseRepository.save(course);
  }

  async delete(id: string, instructorId: string): Promise<{ deleted: boolean }> {
    const course: Course = await this.findById(id);

    if(course.instructor.id !== instructorId)
      throw new ForbiddenException('You do not own this course!');

    const del: DeleteResult = await this.courseRepository.delete(course.id);
    return { deleted: del.affected === 1 };
  }
}
