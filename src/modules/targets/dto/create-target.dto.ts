import { Type } from 'class-transformer';
import { IsNumber, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class CreateTargetDto {
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  url!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  targetPrice!: number;
}
