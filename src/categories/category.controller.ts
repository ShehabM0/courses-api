import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./category.dto";
import { PaginationDTO } from "src/common/pagination.dto";
import { CategoryService } from "./category.service";
import { RolesGuard } from "src/roles/roles.guard";
import { Roles } from "src/roles/roles.decorator";
import { UserRole } from "src/users/user.entity";
import { AuthGuard } from "src/auth/auth.guard";

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('')
  findAll(@Query() paginationDTO: PaginationDTO) {
    return this.categoryService.findAll(paginationDTO);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('')
  create(@Body() createCategoryDTO: CreateCategoryDTO) {
    return this.categoryService.create(createCategoryDTO.name);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDTO: UpdateCategoryDTO) {
    return this.categoryService.update(id, updateCategoryDTO);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }

  @UseGuards(AuthGuard)
  @Get(':slug/courses')
  findCourses(@Param('slug') slug: string, @Query() paginationDTO: PaginationDTO) {
    return this.categoryService.findCourses(slug, paginationDTO);
  }
}
