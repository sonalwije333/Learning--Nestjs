import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { UserRole } from './user-role.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ManyToOne(() => UserRole, { eager: true }) 
  @JoinColumn({ name: 'role_id' })
  role: UserRole;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column()
  contact_number: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Column({ default: false })
  isEmailVerified?: boolean;

  @CreateDateColumn()
  created_at: Date;
}