import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Lesson } from '../lessons/lesson.entity';

@Entity('progress')
@Unique(['enrollment', 'lesson'])
export class Progress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: false })
  isCompleted!: boolean;

  @Column({ nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Enrollment, enrollment => enrollment.progress, { onDelete: 'CASCADE' })
  enrollment!: Enrollment;
  // user + course + lesson
  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  lesson!: Lesson;
}
