"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackEventsService = void 0;
const common_1 = require("@nestjs/common");
const events_1 = require("events");
let FallbackEventsService = class FallbackEventsService {
    eventEmitter = new events_1.EventEmitter();
    emitFallbackRequired(event) {
        this.eventEmitter.emit('fallback.required', event);
    }
    onFallbackRequired(listener) {
        this.eventEmitter.on('fallback.required', listener);
    }
};
exports.FallbackEventsService = FallbackEventsService;
exports.FallbackEventsService = FallbackEventsService = __decorate([
    (0, common_1.Injectable)()
], FallbackEventsService);
//# sourceMappingURL=fallback-events.service.js.map