import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';

@ApiTags('groups')
@Controller('api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // 1. POST /api/group
  @Post('group')
  @ApiOperation({ summary: 'Create a new group and add current user as owner' })
  @ApiResponse({ status: 201, description: 'Group created' })
  createGroup(@Body() dto: CreateGroupDto, @CurrentUser() user: any) {
    return this.groupsService.createGroup(dto, user?.sub);
  }

  // 2. GET /api/me/group
  @Get('me/group')
  @ApiOperation({ summary: 'Get the current user\'s group' })
  @ApiResponse({ status: 200, description: 'Current user group or null' })
  getMyGroup(@CurrentUser() user: any) {
    return this.groupsService.getMyGroup(user?.sub);
  }

  // 3. POST /api/group/invite
  @Post('group/invite')
  @ApiOperation({ summary: 'Generate an invite code for the current user\'s group' })
  @ApiResponse({ status: 201, description: 'Invite created' })
  createInvite(@CurrentUser() user: any) {
    return this.groupsService.createInvite(user?.sub);
  }

  // 4. POST /api/group/join
  @Post('group/join')
  @ApiOperation({ summary: 'Join a group using an invite code' })
  @ApiResponse({ status: 201, description: 'User joined group' })
  joinGroup(@Body() dto: JoinGroupDto, @CurrentUser() user: any) {
    return this.groupsService.joinGroup(user?.sub, dto.code);
  }

  // 5. GET /api/group/members
  @Get('group/members')
  @ApiOperation({ summary: 'List all members in the current user\'s group' })
  @ApiResponse({ status: 200, description: 'Group members' })
  getMembers(@CurrentUser() user: any) {
    return this.groupsService.getMembers(user?.sub);
  }

  // Existing CRUD endpoints (now under /api/group/...)

  @Get('group')
  @ApiOperation({ summary: 'List all groups' })
  @ApiResponse({ status: 200, description: 'List of groups' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get('group/:id')
  @ApiOperation({ summary: 'Get group by id' })
  @ApiResponse({ status: 200, description: 'Group details' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch('group/:id')
  @ApiOperation({ summary: 'Update a group (owner only)' })
  @ApiResponse({ status: 200, description: 'Group updated' })
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(id, dto);
  }

  @Delete('group/:id')
  @ApiOperation({ summary: 'Delete a group (owner only)' })
  @ApiResponse({ status: 200, description: 'Group deleted' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.remove(id, user?.sub);
  }
}
