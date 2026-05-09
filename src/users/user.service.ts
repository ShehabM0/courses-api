import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ListPaginatedResult } from "src/common/pagination/pagination.interface";
import { ListPaginationDTO } from "src/common/pagination/pagination.dto";
import { UpdateUserDTO, UpdateUserPassDTO } from "./user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User, UserRole } from "./user.entity";
import { DeleteResult } from "typeorm/browser";
import { SafeUser } from "./user.interface";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}
  
  async create(user: User): Promise<User> {
    const findUser: boolean = await this.userRepository.existsBy({ email: user.email });
    if(findUser)
      throw new ConflictException('Email already exists');

    const newUser: User = new User();
    Object.assign(newUser, user);
    newUser.password = await bcrypt.hash(user.password, 10);

    const createdUser: User = await this.userRepository.save(newUser);
    return createdUser;
  }
  
  async findAllInstructors(): Promise<User[]> {
    const instructors: User[] = 
      await this.userRepository.find({ where: { role: UserRole.INSTRUCTOR }});
    return instructors;
  }

  async findAll(paginationDTO: ListPaginationDTO): Promise<ListPaginatedResult<User>> {
    const total: number = await this.userRepository.count();
    const offset = paginationDTO.offset ?? 0, limit = paginationDTO.limit ?? total;

    const from = offset
    const to = Math.min(from + limit, total)

    const [users] = await this.userRepository.findAndCount({
      take: limit,
      skip: offset,
    });

    const pagination: ListPaginatedResult<User> = {
      data: users,
      pagination: {
        nextOffset: to,
        limit: limit,
        totalItems: total,
        hasNext: to < total,
      }
    }
    return pagination;
  }

  async findById(id: string): Promise<User> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if(!user)
      throw new NotFoundException('User not found!');
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user: User | null = await this.userRepository.findOneBy({ email });
    if(!user)
      throw new NotFoundException('User not found!');
    return user;
  }

  async update(id: string, userDTO: UpdateUserDTO): Promise<SafeUser> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if(!user) 
      throw new NotFoundException('User not found!');

    Object.assign(user, userDTO);
    await this.userRepository.save(user);

    return user;
  }

  // slef: resetPassword call
  async updatePassword(id: string, updatePasswordDTO: UpdateUserPassDTO, self: boolean = false): Promise<SafeUser> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if(!user) 
      throw new NotFoundException('User not found!');
  
    const { oldPassword, newPassword } = updatePasswordDTO;
    const verifyPass: boolean = self ? true : await this.verifyPassword(user.id, oldPassword);
    if(!verifyPass)
      throw new UnauthorizedException('Old password is incorrect!');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    const { password, ...fields } = user;
    return fields;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if(!user)
      throw new NotFoundException('User not found!');

    const del: DeleteResult = await this.userRepository.delete(user.id);
    return { deleted: del.affected === 1 };
  }

  async verifyPassword(id: string, pass: string): Promise<boolean> {
    const user: User | null = await this.userRepository.findOne({
      where: { id },
      select: { password: true }
    });
    if(!user)
      throw new NotFoundException('User not found!');

    return await bcrypt.compare(pass, user.password);
  }
}
