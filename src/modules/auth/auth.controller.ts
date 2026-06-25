import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DeviceLoginDto } from './dto/device-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('device-login')
  async deviceLogin(@Body() dto: DeviceLoginDto) {
    return this.authService.deviceLogin(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() request: RequestWithUser) {
    return request.user;
  }
}
