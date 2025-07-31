import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { UserRole } from "./entities/user-role.entity";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...userData } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let role = await this.userRoleRepository.findOne({ where: { role_name: 'Customer' } });
    if (!role) {
      role = this.userRoleRepository.create({ role_name: 'Customer' });
      await this.userRoleRepository.save(role);
    }

    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      role,
    });

    return this.usersRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      relations: ['role'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['role'] });
  }
}

export { User };
