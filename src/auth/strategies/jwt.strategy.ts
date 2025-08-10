import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your-strong-secret',
    });

    // Log the JWT_SECRET to debug
    console.log('JWT_SECRET:', this.configService.get<string>('JWT_SECRET'));
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}