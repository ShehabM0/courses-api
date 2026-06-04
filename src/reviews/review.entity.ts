import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Course } from "src/courses/course.entity";
import { User } from "src/users/user.entity";

@Entity('reviews')
@Unique(['user', 'course'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'text', nullable: true })
  comment!: string

  @Column({ type: 'int' })
  rating!: number

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  course!: Course;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
