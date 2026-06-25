"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const express_1 = require("express");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./modules/prisma/prisma.service");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bodyParser: false });
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ limit: '50mb', extended: true }));
    const configService = app.get(config_1.ConfigService);
    const prismaService = app.get(prisma_service_1.PrismaService);
    const port = configService.get('PORT') ?? 3000;
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    await prismaService.enableShutdownHooks(app);
    await app.listen(port);
    common_1.Logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
}
void bootstrap();
//# sourceMappingURL=main.js.map