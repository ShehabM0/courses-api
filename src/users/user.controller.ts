import { Body, Controller, Delete, Get, Param, Patch, Query, Request, UseGuards } from "@nestjs/common";
import { PaginationDTO } from "src/common/pagination.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { UserService } from "./user.service";
import { UpdateUserDTO } from "./user.dto";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    const id: string = req.user.id;
    return this.userService.findById(id);
  }

  // ---- TODO: Admin RoleGuard ----
  @Get()
  findAll(@Query() paginationDTO: PaginationDTO) {
    return this.userService.findAll(paginationDTO);
  }
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
  // -------------------------------

  @UseGuards(AuthGuard)
  @Patch()
  update(@Request() req, @Body() updateUserDTO: UpdateUserDTO) {
    const id: string = req.user.id;
    return this.userService.update(id, updateUserDTO);
  }

  @UseGuards(AuthGuard)
  @Delete()
  delete(@Request() req) {
    const id: string = req.user.id;
    return this.userService.delete(id);
  }
}
