import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitRitualResponseDto {
  @ApiProperty({ example: 'Today I felt productive and focused.', minLength: 1 })
  @IsString()
  @MinLength(1)
  content: string;
}
