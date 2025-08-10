import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../shared/enums/role.enum';
import { PaginatedUsersResponseDto, UserResponseDto } from './dto/user-response.dto';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { role, ...userData } = createUserDto;

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({ 
      where: { email: createUserDto.email } 
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Check if role exists
    const userRole = await this.userRoleRepository.findOne({
      where: { role_name: role },
    });
    if (!userRole) {
      throw new NotFoundException(`Role ${role} not found`);
    }

    // Create user
    const user = this.usersRepository.create({
      ...userData,
      role: userRole,
    });

    return this.usersRepository.save(user);
  }

  async findAll({
    page = 1,
    limit = 10,
    search,
    role,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
  }): Promise<PaginatedUsersResponseDto> {
    const skip = (page - 1) * limit;
 const where: FindOptionsWhere<User> = {};

    if (role) {
      where.role = { role_name: role };
    }

    if (search) {
      where.name = Like(`%${search}%`);
      // For searching in multiple fields:
      // where = [
      //   { name: Like(`%${search}%`) },
      //   { email: Like(`%${search}%`) },
      // ];
    }

    const [users, total] = await this.usersRepository.findAndCount({
      where,
      relations: ['role'],
      skip,
      take: limit,
      order: { created_at: 'DESC' }, // Use the actual column name from your entity
    });

    return {
      data: users.map(UserResponseDto.fromEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

async findOne(id: number): Promise<User> {
  const user = await this.usersRepository.findOne({
    where: { id },
    relations: ['role'],
  });
  
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  
  return user;
}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const updatedUser = this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}