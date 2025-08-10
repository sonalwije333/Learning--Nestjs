import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
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
  ApiQuery,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ 
    summary: 'Create a new user',
    description: 'Admin only endpoint to create new users.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully', 
    type: User 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request. Invalid input data.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden. Only admins can access this endpoint.' 
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

@Get(':id')
  @Roles(Role.Admin, Role.Pharmacist)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ 
    description: 'User details', 
    type: UserResponseDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
async findOne(@Param('id') id: string): Promise<UserResponseDto> {
  const user = await this.usersService.findOne(+id);
  return UserResponseDto.fromEntity(user);
}
  @Patch(':id')
  @Roles(Role.Admin)
  @ApiOperation({ 
    summary: 'Update a user',
    description: 'Admin only endpoint to update user details.'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully', 
    type: User 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request. Invalid input data.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden. Only admins can access this endpoint.' 
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ 
    summary: 'Delete a user',
    description: 'Admin only endpoint to delete a user.'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User deleted successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden. Only admins can access this endpoint.' 
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}