import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult } from "typeorm/browser";
import { User, UserDAO } from "./user.entity";
import { UpdateUserDTO } from "./user.dto";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}
  
  async create(user: User): Promise<UserDAO> {
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

  async findAll(): Promise<UserDAO[]> {
    const users: User[] = await this.userRepository.find();
    const usersExec: UserDAO[] = [];
    for(let user of users) {
      const { password, ...fields } = user;
      usersExec.push(fields);
    }
    return usersExec;
  }

  async findById(id: string): Promise<UserDAO> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if(!user)
      throw new NotFoundException('User not found!');

    const { password, ...fields } = user;
    return fields;
  }

  async findByEmail(email: string): Promise<UserDAO> {
    const user: User | null = await this.userRepository.findOneBy({ email });
    if(!user)
      throw new NotFoundException('User not found!');

    const { password, ...fields } = user;
    return fields;
  }

  async update(id: string, user: UpdateUserDTO): Promise<UserDAO> {
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
