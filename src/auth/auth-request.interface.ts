// src/auth/interfaces/auth-request.interface.ts
import { Request } from 'express';
import { User } from '../users/entities/user.entity'; // Fixed relative path

export interface AuthRequest extends Request {
  user: User;
}