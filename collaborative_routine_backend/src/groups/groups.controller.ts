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

@ApiTags('groups')
@Controller('api/group')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'Group created' })
  create(@Body() dto: CreateGroupDto, @CurrentUser() user: any) {
    // `user` comes from the authentication guard and should contain the current user id
    console.log('user : ', user);

    return this.groupsService.create(dto, user?.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List all groups' })
  @ApiResponse({ status: 200, description: 'List of groups' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by id' })
  @ApiResponse({ status: 200, description: 'Group details' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a group (owner only)' })
  @ApiResponse({ status: 200, description: 'Group updated' })
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a group (owner only)' })
  @ApiResponse({ status: 200, description: 'Group deleted' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.remove(id, user?.id);
  }
}
