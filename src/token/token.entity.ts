import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('revoked_tokens')
export class RevokedToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 1000 })
  token!: string;

  @Column()
  userId!: string;

  // revokedUntil
  @Column()
  expiresAt!: Date;

  @CreateDateColumn()
  revokedAt!: Date;
}
