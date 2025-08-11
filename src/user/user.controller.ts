import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '../shared/enums/role.enum';
import { RolesGuard } from '../shared/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import {  UserResponseDto } from './dto/user-response.dto';
import { PaginatedUsersResponseDto } from './dto/pagination-response.dto';

@ApiTags('Users')
// Tells Swagger that this controller uses JWT authentication
@ApiBearerAuth('JWT-auth')
// Apply authentication & role-based access control to all routes in this controller
@UseGuards(JwtAuthGuard, RolesGuard)
// Base route for all endpoints in this controller
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}


  /**
   * Get all users with pagination
   */
  @Get()
  @Roles(Role.Admin, Role.Pharmacist)
  @ApiOperation({ summary: 'Get all users ' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiOkResponse({
    description: 'Paginated list of users',
    type: PaginatedUsersResponseDto,
  })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('role') role?: Role,
  ): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll({ page, limit, search, role });
  }

  /**
   * Get user by ID
   * Only Admin and Pharmacist roles are allowed to access this endpoint.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard) 
  @Roles(Role.Admin, Role.Pharmacist) 
  @ApiOperation({ summary: 'Get user by ID' }) 
  @ApiParam({ name: 'id', type: Number }) 
  @ApiOkResponse({
    description: 'User details',
    type: UserResponseDto,
  })
  async findOne(
    @Param('id') id: string, // Extracts 'id' from URL
    @Req() req,              // Request object (contains authenticated user info)
  ): Promise<UserResponseDto> {
    console.log('Authenticated user:', req.user); // Debug: log current authenticated user
    const user = await this.usersService.findOne(+id); // Fetch user from DB
    return UserResponseDto.fromEntity(user); // Convert entity to response DTO
  }

  /**
   * Update user details by ID
   * Only Admin can update user data.
   */

@Patch(':id')
@Roles(Role.Admin)
@ApiOperation({ 
  summary: 'Update user by ID', 
  description: 'Admin can update user details. Returns updated user data.' 
})
@ApiParam({ 
  name: 'id', 
  type: Number, 
  description: 'User ID to update',
  example: 1 
})
@ApiResponse({ 
  status: 200, 
  description: 'User updated successfully', 
  type: UserResponseDto 
})
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 404, description: 'User not found' })
@ApiResponse({ status: 403, description: 'Forbidden' })
async updateUser(
  @Param('id') id: string,
  @Body() updateUserDto: UpdateUserDto,
): Promise<UserResponseDto> {
  const updatedUser = await this.usersService.update(+id, updateUserDto);
  return UserResponseDto.fromEntity(updatedUser);
}

  /**
   * Delete a user by ID
   * Only Admin can delete users.
   */
  @Delete(':id')
  @Roles(Role.Admin) // Restrict to Admin role
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Admin only endpoint to delete a user.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only admins can access this endpoint.',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id); // Remove user from DB
  }
}
