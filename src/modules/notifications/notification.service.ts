import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { loadOptionalPackage } from '../common/utils/optional-package.util';

interface NodemailerModule {
  createTransport(options: Record<string, unknown>): {
    sendMail(options: Record<string, unknown>): Promise<unknown>;
  };
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly configService: ConfigService) {}

  async notifyPriceDrop(params: {
    user: Pick<User, 'email' | 'deviceToken'>;
    url: string;
    targetPrice: string;
    currentPrice: string;
  }): Promise<void> {
    if (!params.user.email) {
      this.logger.warn(`Skipping notification for device ${params.user.deviceToken}: no email set`);
      return;
    }

    if (this.configService.get<string>('RESEND_API_KEY')) {
      await this.sendWithResend(params);
      return;
    }

    await this.sendWithNodemailer(params);
  }

  private async sendWithResend(params: {
    user: Pick<User, 'email' | 'deviceToken'>;
    url: string;
    targetPrice: string;
    currentPrice: string;
  }): Promise<void> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const from = this.configService.get<string>('MAIL_FROM') ?? 'alerts@stealth-scape.local';

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

  private async sendWithNodemailer(params: {
    user: Pick<User, 'email' | 'deviceToken'>;
    url: string;
    targetPrice: string;
    currentPrice: string;
  }): Promise<void> {
    const nodemailer = loadOptionalPackage<NodemailerModule>('nodemailer');
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT') ?? 587;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('MAIL_FROM') ?? 'alerts@stealth-scape.local';

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
}
