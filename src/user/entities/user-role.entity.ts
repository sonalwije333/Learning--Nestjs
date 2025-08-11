import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['Admin', 'Pharmacist', 'Cashier', 'Customer', 'Supplier'],
    unique: true,
  })
  role_name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  constructor(role_name?: string) {
    if (role_name) {
      this.role_name = role_name;
    }
  }
}