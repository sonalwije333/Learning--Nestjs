import { Controller, Get, Post, UseGuards,Request } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthenticatedGuard } from './auth/authenticated.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

@UseGuards(LocalAuthGuard)

  // POST /login
  @Post('login')
  login(@Request() req): any{
    return req.user;
  }
 @UseGuards(AuthenticatedGuard)
  @Get('protected')
  getHello(@Request() req): string {
    return req.user;
  }
}
