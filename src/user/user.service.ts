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
    // Inject the User repository to interact with the `users` table
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    // Inject the UserRole repository to interact with the `user_roles` table
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  /**
   * Create a new user in the database
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { role, ...userData } = createUserDto;

    // 1️⃣ Check if email is already taken
    const existingUser = await this.usersRepository.findOne({ 
      where: { email: createUserDto.email } 
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 2️⃣ Check if the provided role exists
    const userRole = await this.userRoleRepository.findOne({
      where: { role_name: role },
    });
    if (!userRole) {
      throw new NotFoundException(`Role ${role} not found`);
    }

    // 3️⃣ Create a new user entity and assign the found role
    const user = this.usersRepository.create({
      ...userData,
      role: userRole,
    });

    // 4️⃣ Save the user to the database
    return this.usersRepository.save(user);
  }

  /**
   * Retrieve all users with optional pagination, search, and role filtering
   */
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

    // Filter by role if provided
    if (role) {
      where.role = { role_name: role };
    }

    // Filter by search keyword in name (can be extended to multiple fields)
    if (search) {
      where.name = Like(`%${search}%`);
      // For searching in multiple fields:
      // where = [
      //   { name: Like(`%${search}%`) },
      //   { email: Like(`%${search}%`) },
      // ];
    }

    // Fetch users with role relation and count for pagination
    const [users, total] = await this.usersRepository.findAndCount({
      where,
      relations: ['role'], // Include role data in results
      skip,
      take: limit,
      order: { created_at: 'DESC' }, // Sort newest first
    });
    return {
      data: users.map(UserResponseDto.fromEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieve a single user by ID
   */
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    
    // Throw 404 if not found
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  /**
   * Retrieve a single user by email
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  /**
   * Update user details by ID
   * @param id - User ID
   * @param updateUserDto - Fields to update
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Ensure the user exists before updating
    const user = await this.findOne(id);

    // Merge existing user with new data
    const updatedUser = this.usersRepository.merge(user, updateUserDto);

    // Save changes to database
    return this.usersRepository.save(updatedUser);
  }

  /**
   * Delete a user by ID
   */
  async remove(id: number): Promise<void> {
    // Ensure the user exists before deletion
    const user = await this.findOne(id);
    // Remove from database
    await this.usersRepository.remove(user);    
  }
}
