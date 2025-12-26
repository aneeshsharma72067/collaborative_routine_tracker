import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Delete,
  UseGuards,
  ParseUUIDPipe,
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
@Controller('group')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // 1. POST /api/group
  @Post()
  @ApiOperation({ summary: 'Create a new group and add current user as owner' })
  @ApiResponse({ status: 201, description: 'Group created' })
  createGroup(@Body() dto: CreateGroupDto, @CurrentUser() user: any) {
    return this.groupsService.createGroup(dto, user?.sub);
  }

  // 2. GET /api/me/group
  @Get('me')
  @ApiOperation({ summary: 'Get the current user\'s group' })
  @ApiResponse({ status: 200, description: 'Current user group or null' })
  getMyGroup(@CurrentUser() user: any) {
    return this.groupsService.getMyGroup(user?.sub);
  }

  // 3. POST /api/group/invite
  @Post('invite')
  @ApiOperation({ summary: 'Generate an invite code for the current user\'s group' })
  @ApiResponse({ status: 201, description: 'Invite created' })
  createInvite(@CurrentUser() user: any) {
    return this.groupsService.createInvite(user?.sub);
  }

  // 4. POST /api/group/join
  @Post('join')
  @ApiOperation({ summary: 'Join a group using an invite code' })
  @ApiResponse({ status: 201, description: 'User joined group' })
  joinGroup(@Body() dto: JoinGroupDto, @CurrentUser() user: any) {
    return this.groupsService.joinGroup(user?.sub, dto.code);
  }

  // 5. GET /api/group/members
  @Get('members')
  @ApiOperation({ summary: 'List all members in the current user\'s group' })
  @ApiResponse({ status: 200, description: 'Group members' })
  getMembers(@CurrentUser() user: any) {
    return this.groupsService.getMembers(user?.sub);
  }

  // Existing CRUD endpoints (exposed under /api/groups/...)

  @Get()
  @ApiOperation({ summary: 'List all groups' })
  @ApiResponse({ status: 200, description: 'List of groups' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by id' })
  @ApiResponse({ status: 200, description: 'Group details' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a group (owner only)' })
  @ApiResponse({ status: 200, description: 'Group updated' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group (owner only)' })
  @ApiResponse({ status: 200, description: 'Group deleted' })
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: any,
  ) {
    return this.groupsService.remove(id, user?.sub);
  }
}
