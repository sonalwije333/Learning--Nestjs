import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../users/enums/role.enum';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, enumName: 'Role', default: Role.Customer })
  @IsEnum(Role)
  role: Role = Role.Customer;

  @ApiProperty({ required: false })
  contactNumber?: string;
}