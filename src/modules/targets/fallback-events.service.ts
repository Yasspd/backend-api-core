import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { FallbackEvent } from './interfaces/fallback-event.interface';

@Injectable()
export class FallbackEventsService {
  private readonly eventEmitter = new EventEmitter();

  emitFallbackRequired(event: FallbackEvent): void {
    this.eventEmitter.emit('fallback.required', event);
  }

  onFallbackRequired(listener: (event: FallbackEvent) => void): void {
    this.eventEmitter.on('fallback.required', listener);
  }
}
