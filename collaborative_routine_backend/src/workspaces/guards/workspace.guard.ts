import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspaceMembersRepository } from '../workspace-members.repository';
import { WORKSPACE_ROLES_KEY } from '../decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../../common/enums/workspace-role.enum';
import { RequestUser } from '../../common/types';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly workspaceMembers: WorkspaceMembersRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user: RequestUser | undefined = request.user;
    const workspaceId: string | undefined = request.params?.workspaceId;

    if (!user?.sub) {
      throw new ForbiddenException('Authentication required');
    }

    if (!workspaceId) {
      throw new BadRequestException('workspaceId parameter is required');
    }

    const membership = await this.workspaceMembers.findMembership(
      workspaceId,
      user.sub,
    );

    if (!membership) {
      throw new ForbiddenException('Access to workspace denied');
    }

    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles?.length && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient workspace role');
    }

    request.workspaceMembership = membership;
    return true;
  }
}
