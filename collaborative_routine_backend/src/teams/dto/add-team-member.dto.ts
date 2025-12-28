import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TeamRole } from '../../common/enums/team-role.enum';

export class AddTeamMemberDto {
  @ApiProperty({ example: 'd4e5f6a7-b8c9-4d0e-9f1a-2b3c4d5e6f70', format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: TeamRole, example: TeamRole.MEMBER })
  @IsEnum(TeamRole)
  role: TeamRole;
}
