import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';

@Entity('enrollments')
@Unique(['user', 'course'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: false })
  isCompleted!: boolean;

  @CreateDateColumn()
  enrolledAt!: Date;

  @Column({ nullable: true })
  completedAt?: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  course!: Course;
}
