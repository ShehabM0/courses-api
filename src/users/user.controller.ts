import { Body, Controller, Delete, Get, Param, Patch, Query, Request, UseGuards } from "@nestjs/common";
import { PaginationDTO } from "src/common/pagination.dto";
import { RolesGuard } from "src/roles/roles.guard";
import { Roles } from "src/roles/roles.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { UserService } from "./user.service";
import { UpdateUserDTO } from "./user.dto";
import { UserRole } from "./user.entity";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    const id: string = req.user.uid;
    return this.userService.findById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query() paginationDTO: PaginationDTO) {
    return this.userService.findAll(paginationDTO);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @UseGuards(AuthGuard)
  @Patch()
  update(@Request() req, @Body() updateUserDTO: UpdateUserDTO) {
    const id: string = req.user.uid;
    return this.userService.update(id, updateUserDTO);
  }

  @UseGuards(AuthGuard)
  @Delete()
  delete(@Request() req) {
    const id: string = req.user.uid;
    return this.userService.delete(id);
  }
}
