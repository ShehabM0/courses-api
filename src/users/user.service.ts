import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PaginatedResult } from "src/common/pagination.interface";
import { PaginationDTO } from "src/common/pagination.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User, UserRole } from "./user.entity";
import { DeleteResult } from "typeorm/browser";
import { SafeUser } from "./user.interface";
import { UpdateUserDTO } from "./user.dto";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}
  
  async create(user: User): Promise<SafeUser> {
    const findUser: boolean = await this.userRepository.existsBy({ email: user.email });
    if(findUser)
      throw new ConflictException('Email already exists');

    const newUser: User = new User();
    Object.assign(newUser, user);
    newUser.password = await bcrypt.hash(user.password, 10);

    const createdUser: User = await this.userRepository.save(newUser);

    const { password, ...fields } = createdUser;
    return fields;
  }
  
  async findAllInstructors(): Promise<SafeUser[]> {
    const instructors: SafeUser[] = 
      await this.userRepository.find({ where: { role: UserRole.INSTRUCTOR }});
    return instructors;
  }

  async findAll(paginationDTO: PaginationDTO): Promise<PaginatedResult<SafeUser>> {
    const total: number = await this.userRepository.count();
    const offset = paginationDTO.offset ?? 0, limit = paginationDTO.limit ?? total;

    const from = offset
    const to = Math.min(from + limit, total)

    const [users] = await this.userRepository.findAndCount({
      take: limit,
      skip: offset,
    });

    const safeUsers: SafeUser[] = [];
    for(let user of users) {
      const { password, ...fields } = user;
      safeUsers.push(fields);
    }

    const pagination: PaginatedResult<SafeUser> = {
      data: safeUsers,
      pagination: {
        nextOffset: to,
        limit: limit,
        totalItems: total,
        hasNext: to < total,
      }
    }
    return pagination;
  }

  async findById(id: string): Promise<SafeUser> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if(!user)
      throw new NotFoundException('User not found!');

    const { password, ...fields } = user;
    return fields;
  }

  async findByEmail(email: string): Promise<SafeUser> {
    const user: User | null = await this.userRepository.findOneBy({ email });
    if(!user)
      throw new NotFoundException('User not found!');

    const { password, ...fields } = user;
    return fields;
  }

  async update(id: string, user: UpdateUserDTO): Promise<SafeUser> {
    const findUser: User | null = await this.userRepository.findOneBy({ id });
    if(!findUser) 
      throw new NotFoundException('User not found!');
  
    if (user.password)
      user.password = await bcrypt.hash(user.password, 10);

    Object.assign(findUser, user);
    const updatedUser: User = await this.userRepository.save(findUser);

    const { password, ...fields } = updatedUser;
    return fields;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if(!user)
      throw new NotFoundException('User not found!');

    const del: DeleteResult = await this.userRepository.delete(user.id);
    return { deleted: del.affected === 1 };
  }

  async verifyPass(id: string, pass: string): Promise<boolean> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if(!user)
      throw new NotFoundException('User not found!');

    return await bcrypt.compare(pass, user.password);
  }
}
