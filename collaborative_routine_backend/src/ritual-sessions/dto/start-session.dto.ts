import { IsISO8601, IsOptional } from 'class-validator';

export class StartSessionDto {
  @IsOptional()
  @IsISO8601()
  scheduledFor?: string;
}
