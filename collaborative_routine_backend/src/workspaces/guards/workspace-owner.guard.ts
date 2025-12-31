import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspacesRepository } from '../workspaces.repository';

@Injectable()
export class WorkspaceOwnerGuard implements CanActivate {
  constructor(private readonly workspacesRepository: WorkspacesRepository) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId: string | undefined = request.params?.workspaceId;

    if (!user?.sub) {
      throw new ForbiddenException('Authentication required');
    }

    if (!workspaceId) {
      throw new BadRequestException('workspaceId parameter is required');
    }

    const workspace = await this.workspacesRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== user.sub) {
      throw new ForbiddenException('Workspace owner permissions required');
    }

    request.workspace = workspace;
    request.isWorkspaceOwner = true;
    return true;
  }
}
