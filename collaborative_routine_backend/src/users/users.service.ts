import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async findById(id: string) {
    const user = await this.users.findById(id);
    Logger.log(`Fetching profile for user ID in service: ${id}`);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.users.updateProfile(id, dto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
