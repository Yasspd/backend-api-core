import { TargetsService } from '../targets/targets.service';
export declare class SchedulerService {
    private readonly targetsService;
    private readonly logger;
    constructor(targetsService: TargetsService);
    handleHourlyPolling(): Promise<void>;
}
