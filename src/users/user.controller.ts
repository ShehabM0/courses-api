import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateUserDTO } from "./user.dto";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDTO: UpdateUserDTO) {
    return this.userService.update(id, updateUserDTO);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
