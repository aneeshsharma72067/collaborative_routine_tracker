import { ApiProperty } from '@nestjs/swagger';
import {
	IsIn,
	IsMilitaryTime,
	IsOptional,
	IsString,
	IsHexColor,
} from 'class-validator';

export class RoutineBlockDto {
	@ApiProperty({ example: '06:00' })
	@IsString()
	@IsMilitaryTime()
	startTime: string;

	@ApiProperty({ example: '07:00' })
	@IsString()
	@IsMilitaryTime()
	endTime: string;

	@ApiProperty({ example: 'Gym' })
	@IsString()
	title: string;

	@ApiProperty({ enum: ['public', 'busy', 'hidden'], default: 'public' })
	@IsString()
	@IsIn(['public', 'busy', 'hidden'])
	visibility: 'public' | 'busy' | 'hidden';

	@ApiProperty({ example: '#FFAABB', required: false })
	@IsOptional()
	@IsString()
	@IsHexColor()
	color?: string;
}

export class RoutineBlockResponseDto extends RoutineBlockDto {
	@ApiProperty({ example: 'uuid-v4' })
	id: string;
}
