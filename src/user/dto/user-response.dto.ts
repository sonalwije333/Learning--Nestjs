// src/users/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { Role } from '../../shared/enums/role.enum';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ enum: Role, example: Role.Pharmacist })
  role: string;

  @ApiProperty({ example: '+1234567890' })
  contactNumber: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: true })
  isEmailVerified: boolean;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.role = user.role.role_name;
    dto.contactNumber = user.contact_number;
    dto.createdAt = user.created_at;
    dto.isEmailVerified = user.isEmailVerified;
    return dto;
  }
}