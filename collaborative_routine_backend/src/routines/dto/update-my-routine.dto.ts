import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { RoutineBlockDto } from './routine-block.dto';

export class UpdateMyRoutineDto {
	@ApiProperty({ type: [RoutineBlockDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => RoutineBlockDto)
	blocks: RoutineBlockDto[];
}
