import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class DeviceLoginDto {
  @IsString()
  @MinLength(12)
  deviceToken!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
