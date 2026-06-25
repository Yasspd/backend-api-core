import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
export declare class NotificationService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    notifyPriceDrop(params: {
        user: Pick<User, 'email' | 'deviceToken'>;
        url: string;
        targetPrice: string;
        currentPrice: string;
    }): Promise<void>;
    private sendWithResend;
    private sendWithNodemailer;
}
