import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class JoinGroupDto {
	@ApiProperty({ example: 'ABCD1234', minLength: 4, maxLength: 32 })
	@IsString()
	@Length(4, 32)
	code: string;
}
