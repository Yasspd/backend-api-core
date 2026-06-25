import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceLoginDto } from './dto/device-login.dto';
export declare class AuthService {
    private readonly prismaService;
    private readonly jwtService;
    constructor(prismaService: PrismaService, jwtService: JwtService);
    deviceLogin(dto: DeviceLoginDto): Promise<{
        accessToken: string;
        user: Pick<User, 'id' | 'deviceToken' | 'email' | 'tariff' | 'createdAt' | 'updatedAt'>;
    }>;
}
