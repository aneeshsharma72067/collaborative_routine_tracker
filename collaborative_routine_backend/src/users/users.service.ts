import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findById(id: number | string) {
    return this.repo.findOne({ where: { id } as any });
  }

  update(id: number | string, dto: UpdateUserDto) {
    return this.repo.update({ id } as any, dto as any);
  }
}
