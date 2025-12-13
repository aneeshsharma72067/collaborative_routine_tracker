import { ApiProperty } from '@nestjs/swagger';
import { RoutineBlockResponseDto } from './routine-block.dto';

export class GetMyRoutineResponseDto {
	@ApiProperty({ type: [RoutineBlockResponseDto] })
	blocks: RoutineBlockResponseDto[];
}
