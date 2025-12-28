import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RitualStatus } from '../../common/enums/ritual-status.enum';

export class UpdateRitualStatusDto {
  @ApiProperty({ enum: RitualStatus })
  @IsEnum(RitualStatus)
  status: RitualStatus;
}
