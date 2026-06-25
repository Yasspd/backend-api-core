"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetsModule = void 0;
const common_1 = require("@nestjs/common");
const ai_module_1 = require("../ai/ai.module");
const auth_module_1 = require("../auth/auth.module");
const notifications_module_1 = require("../notifications/notifications.module");
const scraper_module_1 = require("../scraper/scraper.module");
const fallback_events_service_1 = require("./fallback-events.service");
const targets_controller_1 = require("./targets.controller");
const targets_service_1 = require("./targets.service");
let TargetsModule = class TargetsModule {
};
exports.TargetsModule = TargetsModule;
exports.TargetsModule = TargetsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, ai_module_1.AiModule, scraper_module_1.ScraperModule, notifications_module_1.NotificationsModule],
        controllers: [targets_controller_1.TargetsController],
        providers: [targets_service_1.TargetsService, fallback_events_service_1.FallbackEventsService],
        exports: [targets_service_1.TargetsService, fallback_events_service_1.FallbackEventsService],
    })
], TargetsModule);
//# sourceMappingURL=targets.module.js.map