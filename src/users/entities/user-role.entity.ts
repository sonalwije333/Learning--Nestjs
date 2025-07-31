import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['Admin', 'Pharmacist', 'Cashier', 'Customer', 'Supplier'],
    default: 'Customer'
  })
  role_name: string;

  @OneToMany(() => User, user => user.role)
  users: User[];
}