import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User): Promise<TokenResponseDto> {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.role_name,
      isVerified: user.isEmailVerified,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
      }),
    };
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userService.findOneByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
      isEmailVerified: false, // Default to false until verified
    });

    // Send verification email
    const token = this.jwtService.sign(
      { email: user.email },
      { expiresIn: '1d' },
    );
    await this.mailService.sendVerificationEmail(user.email, token);

    return user;
  }

  async refreshToken(user: User): Promise<TokenResponseDto> {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.role_name,
      isVerified: user.isEmailVerified,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
      }),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.findOneByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal if user doesn't exist
      return;
    }

    const resetToken = this.jwtService.sign(
      { email: user.email },
      { expiresIn: '1h' },
    );
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    let email: string;
    try {
      const payload = this.jwtService.verify(resetPasswordDto.token);
      email = payload.email;
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
    await this.userService.update(user.id, { password: hashedPassword });
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    let email: string;
    try {
      const payload = this.jwtService.verify(verifyEmailDto.token);
      email = payload.email;
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.userService.update(user.id, { isEmailVerified: true });
  }
  private generateTokens(user: User): TokenResponseDto {
  const payload: JwtPayload = {
    sub: user.id,           // Must include user ID
    email: user.email,
    role: user.role.role_name  // Include role
  };

  return {
    access_token: this.jwtService.sign(payload),
     refresh_token: this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    }),
  };
}
}