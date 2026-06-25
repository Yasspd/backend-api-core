import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TariffType, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceLoginDto } from './dto/device-login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async deviceLogin(dto: DeviceLoginDto): Promise<{
    accessToken: string;
    user: Pick<User, 'id' | 'deviceToken' | 'email' | 'tariff' | 'createdAt' | 'updatedAt'>;
  }> {
    const normalizedEmail = dto.email?.trim().toLowerCase();

    const user = await this.prismaService.user.upsert({
      where: { deviceToken: dto.deviceToken },
      create: {
        deviceToken: dto.deviceToken,
        email: normalizedEmail,
        tariff: TariffType.FREE,
      },
      update: normalizedEmail
        ? {
            email: normalizedEmail,
          }
        : {},
      select: {
        id: true,
        deviceToken: true,
        email: true,
        tariff: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      deviceToken: user.deviceToken,
      email: user.email,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
    };
  }
}
