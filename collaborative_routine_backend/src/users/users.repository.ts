import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  create(payload: Partial<User>) {
    return this.repository.create(payload);
  }

  save(user: User) {
    return this.repository.save(user);
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string, includePassword = false) {
    const builder = this.repository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (includePassword) {
      builder.addSelect('user.passwordHash');
    }

    return builder.getOne();
  }

  async updateProfile(id: string, partial: Partial<User>) {
    await this.repository.update({ id }, partial);
    return this.findById(id);
  }
}
