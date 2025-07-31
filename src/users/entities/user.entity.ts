// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @ManyToOne(() => UserRole, (role) => role.users, { eager: true }) // This is the inverse side
  @JoinColumn({ name: 'role_id' })
  role: UserRole; // This is a single UserRole, not an array

  @Column({ name: 'contact_number', length: 20, nullable: true })
  contactNumber: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}