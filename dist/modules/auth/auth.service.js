"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prismaService;
    jwtService;
    constructor(prismaService, jwtService) {
        this.prismaService = prismaService;
        this.jwtService = jwtService;
    }
    async deviceLogin(dto) {
        const normalizedEmail = dto.email?.trim().toLowerCase();
        const user = await this.prismaService.user.upsert({
            where: { deviceToken: dto.deviceToken },
            create: {
                deviceToken: dto.deviceToken,
                email: normalizedEmail,
                tariff: client_1.TariffType.FREE,
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
        const payload = {
            sub: user.id,
            deviceToken: user.deviceToken,
            email: user.email,
        };
        return {
            accessToken: await this.jwtService.signAsync(payload),
            user,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map