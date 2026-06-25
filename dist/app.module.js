"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const ai_module_1 = require("./modules/ai/ai.module");
const auth_module_1 = require("./modules/auth/auth.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const prisma_module_1 = require("./modules/prisma/prisma.module");
const scheduler_module_1 = require("./modules/scheduler/scheduler.module");
const scraper_module_1 = require("./modules/scraper/scraper.module");
const targets_module_1 = require("./modules/targets/targets.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            ai_module_1.AiModule,
            scraper_module_1.ScraperModule,
            notifications_module_1.NotificationsModule,
            targets_module_1.TargetsModule,
            scheduler_module_1.SchedulerModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map