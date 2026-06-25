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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const optional_package_util_1 = require("../common/utils/optional-package.util");
let NotificationService = NotificationService_1 = class NotificationService {
    configService;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async notifyPriceDrop(params) {
        if (!params.user.email) {
            this.logger.warn(`Skipping notification for device ${params.user.deviceToken}: no email set`);
            return;
        }
        if (this.configService.get('RESEND_API_KEY')) {
            await this.sendWithResend(params);
            return;
        }
        await this.sendWithNodemailer(params);
    }
    async sendWithResend(params) {
        const apiKey = this.configService.get('RESEND_API_KEY');
        const from = this.configService.get('MAIL_FROM') ?? 'alerts@stealth-scape.local';
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not configured');
        }
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from,
                to: [params.user.email],
                subject: 'Price drop detected',
                html: `<p>Price dropped for <a href="${params.url}">${params.url}</a>.</p><p>Current price: ${params.currentPrice}</p><p>Your target: ${params.targetPrice}</p>`,
            }),
        });
        if (!response.ok) {
            const body = await response.text();
            this.logger.error(`Resend notification failed: ${response.status} ${body}`);
        }
    }
    async sendWithNodemailer(params) {
        const nodemailer = (0, optional_package_util_1.loadOptionalPackage)('nodemailer');
        const host = this.configService.get('SMTP_HOST');
        const port = this.configService.get('SMTP_PORT') ?? 587;
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');
        const from = this.configService.get('MAIL_FROM') ?? 'alerts@stealth-scape.local';
        if (!host || !user || !pass) {
            this.logger.warn('SMTP settings are incomplete, skipping nodemailer notification');
            return;
        }
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
        });
        await transporter.sendMail({
            from,
            to: params.user.email,
            subject: 'Price drop detected',
            text: `Price dropped for ${params.url}. Current price: ${params.currentPrice}. Target price: ${params.targetPrice}.`,
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map