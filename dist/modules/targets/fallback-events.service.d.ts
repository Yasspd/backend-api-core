import { FallbackEvent } from './interfaces/fallback-event.interface';
export declare class FallbackEventsService {
    private readonly eventEmitter;
    emitFallbackRequired(event: FallbackEvent): void;
    onFallbackRequired(listener: (event: FallbackEvent) => void): void;
}
