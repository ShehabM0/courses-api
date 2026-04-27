import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

let categories: string[] = [
  'Backend',
  'Frontend',
  'Mobile Development',
  'DevOps',
  'Database',
  'Machine Learning',
  'Cloud Computing',
  'Cyber Security',
  'Data Science',
  'Artificial Intelligence',
  'Game Development',
  'Embedded Systems',
  'Blockchain',
  'UI/UX Design',
  'Testing & QA',
  'Software Architecture',
  'Networking',
  'System Administration',
  'Big Data',
  'AR/VR Development',
  'Desktop Development',
  'API Development',
  'Microservices',
  'Web3',
  'Data Engineering',
  'SecOps',
  'IoT Development',
  'Edge Computing',
  'Infrastructure as Code',
  'Data Visualization',
  'Business Intelligence',
  'Low-Code/No-Code',
  'Technical Writing',
  'Product Management',
  'Open Source',
  'Mainframe Development'
];

@Injectable()
export class CategorySeed {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async seed() {
    let addedCategories = 0;
    for (const name of categories) {
      const exists = await this.categoryRepository.findOne({
        where: { name },
      });

      if (!exists) {
        const category = this.categoryRepository.create({ name });
        await this.categoryRepository.save(category);
        addedCategories++;
      }
    }

    const totalCategories: number = await this.categoryRepository.count();
    console.log("----------Category Seed----------");
    console.log("Categories seeded: " + addedCategories);
    console.log("Total Categories: " + totalCategories);
    console.log("---------------------------------");
  }
}
