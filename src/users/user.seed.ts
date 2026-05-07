import { User, UserRole } from 'src/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    const addedUsers = 20;
    for (let i = 0; i < addedUsers; i++) {
      const hashedPassword = await bcrypt.hash('123', 10);

      const student = this.userRepository.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
        role: faker.helpers.arrayElement([
          UserRole.STUDENT,
          UserRole.INSTRUCTOR,
        ]),
        isVerified: true
      });

      await this.userRepository.save(student);
    }

    const totalUsers: number = await this.userRepository.count();
    console.log("----------User Seed------------");
    console.log("Users seeded: " + addedUsers);
    console.log("Total Users: " + totalUsers);
    console.log("---------------------------------");
  }
}
