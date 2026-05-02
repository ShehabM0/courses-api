import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PaginatedResult } from "src/common/pagination.interface";
import { PaginationDTO } from "src/common/pagination.dto";
import { Course } from "src/courses/course.entity";
import { UpdateCategoryDTO } from "./category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult } from "typeorm/browser";
import { Category } from "./category.entity";
import { Repository } from "typeorm";
import { ILike } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findById(id: string): Promise<Category | null> {
    const category: Category | null = await this.categoryRepository.findOneBy({id});
    return category;
  }

  async findByIds(categoryIds: string[]): Promise<Category[]> {
    return await this.categoryRepository.findByIds(categoryIds);
  }

  async findAll(paginationDTO: PaginationDTO): Promise<PaginatedResult<Category>> {
    const offset = paginationDTO.offset ?? 0;
    const limit = paginationDTO.limit ?? 10;
    const query = paginationDTO.query?.trim() ?? '';

    const [categories, total] = await this.categoryRepository.findAndCount({
      where: query ? { slug: ILike(`%${query}%`) } : {},
      take: limit,
      skip: offset,
    });

    const to = Math.min(offset + limit, total);

    const pagination: PaginatedResult<Category> = {
      data: categories,
      pagination: {
        nextOffset: to,
        limit: limit,
        totalItems: total,
        hasNext: to < total,
      }
    }
    return pagination;
  }

  async create(name: string): Promise<Category> {
    const slug = name.toLocaleLowerCase().trim().replace(/\s+/g, '-');

    const findCategory: Category | null = await this.categoryRepository.findOneBy({ slug });
    if(findCategory)
      throw new ConflictException('Category already exist!');

    const category: Category = await this.categoryRepository.save({ name, slug });
    return category;
  }

  async update(id: string, updateCategoryDTO: UpdateCategoryDTO): Promise<Category> {
    const findCategory: Category | null = await this.categoryRepository.findOneBy({ id });
    if(!findCategory) 
      throw new NotFoundException('Category not found!');

    if(updateCategoryDTO.slug)
      updateCategoryDTO.slug = 
        updateCategoryDTO.slug.toLocaleLowerCase().trim().replace(/\s+/g, '-');
  
    Object.assign(findCategory, updateCategoryDTO);
    const updatedCategory: Category = await this.categoryRepository.save(findCategory);
    return updatedCategory;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const findCategory: Category | null = await this.categoryRepository.findOneBy({ id });
    if(!findCategory) 
      throw new NotFoundException('Category not found!');

    findCategory.courses = [];
    await this.categoryRepository.save(findCategory);

    const del: DeleteResult = await this.categoryRepository.delete(findCategory.id);
    return { deleted: del.affected === 1 };
  }

  async findCourses(slug: string, paginationDTO: PaginationDTO) {
    slug = slug.toLocaleLowerCase().trim().replace(/\s+/g, '-');

    const category: Category | null = await this.categoryRepository.findOne({
        where: { slug },
        relations: ['courses']
    });
    if(!category)
      throw new NotFoundException('Category not found!');

    const categoryCourses: Course[] = category.courses;


    const total: number = categoryCourses.length;
    const offset = paginationDTO.offset ?? 0, limit = paginationDTO.limit ?? total;

    const from = offset
    const to = Math.min(from + limit, total)

    const courses: Course[] = categoryCourses.slice(from, to);

    const pagination: PaginatedResult<Course> = {
      data: courses,
      pagination: {
        nextOffset: to,
        limit: limit,
        totalItems: total,
        hasNext: to < total,
      }
    }
    return pagination;
  }
}
