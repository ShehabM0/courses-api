import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PaginatedResult } from "src/common/pagination.interface";
import { PaginationDTO } from "src/common/pagination.dto";
import { UpdateCategoryDTO } from "./category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult } from "typeorm/browser";
import { Category } from "./category.entity";
import { Repository } from "typeorm";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(paginationDTO: PaginationDTO): Promise<PaginatedResult<Category>> {
    const total: number = await this.categoryRepository.count();
    const offset = paginationDTO.offset ?? 0, limit = paginationDTO.limit ?? total;

    const from = offset
    const to = Math.min(from + limit, total)

    const categories = await this.categoryRepository.find({
      take: limit,
      skip: offset,
    });

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
}
