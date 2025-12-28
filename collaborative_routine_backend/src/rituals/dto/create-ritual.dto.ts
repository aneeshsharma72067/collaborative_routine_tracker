import { IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RitualType } from '../../common/enums/ritual-type.enum';
import { RitualFrequency } from '../../common/enums/ritual-frequency.enum';

export class CreateRitualDto {
  @ApiProperty({ example: 'Weekly Team Retro', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: RitualType })
  @IsEnum(RitualType)
  type: RitualType;

  @ApiProperty({ enum: RitualFrequency })
  @IsEnum(RitualFrequency)
  frequency: RitualFrequency;
}
