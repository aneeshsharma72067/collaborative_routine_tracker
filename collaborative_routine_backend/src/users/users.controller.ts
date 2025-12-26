import { Controller, Get, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.usersService.findById(user?.sub || user?.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user?.sub || user?.id, dto);
  }
}
