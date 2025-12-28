import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ example: 'Operation completed successfully', required: false })
  message?: string;
}
