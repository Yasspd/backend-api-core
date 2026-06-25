import { IsString, MaxLength } from 'class-validator';

export class FallbackHtmlDto {
  @IsString()
  @MaxLength(2_000_000)
  html!: string;
}
