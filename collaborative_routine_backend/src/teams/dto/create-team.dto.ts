import { IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Product Pod A', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'b7c9d3f2-1a4e-4e5b-9c2d-7f8a9b0c1d2e', format: 'uuid' })
  @IsUUID()
  leadUserId: string;
}
