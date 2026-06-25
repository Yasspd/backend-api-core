import { AuthService } from './auth.service';
import { DeviceLoginDto } from './dto/device-login.dto';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    deviceLogin(dto: DeviceLoginDto): Promise<{
        accessToken: string;
        user: Pick<import(".prisma/client").User, "id" | "deviceToken" | "email" | "tariff" | "createdAt" | "updatedAt">;
    }>;
    getProfile(request: RequestWithUser): Promise<import("./interfaces/jwt-payload.interface").JwtPayload>;
}
