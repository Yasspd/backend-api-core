export interface FallbackEvent {
  targetId: string;
  userId: string;
  url: string;
  reason: string;
  requiredAt: Date;
}
