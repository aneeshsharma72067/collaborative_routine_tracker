import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceRole } from '../../common/enums/workspace-role.enum';

export class AddWorkspaceMemberDto {
  @ApiProperty({ example: 'a3f47b76-8b2c-4c3d-9e6e-1a2b3c4d5e6f', format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: WorkspaceRole, example: WorkspaceRole.MEMBER })
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}
