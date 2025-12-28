import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RitualResponse } from './entities/ritual-response.entity';

@Injectable()
export class RitualResponsesRepository {
  constructor(
    @InjectRepository(RitualResponse)
    private readonly repository: Repository<RitualResponse>,
  ) {}

  create(payload: Partial<RitualResponse>) {
    return this.repository.create(payload);
  }

  save(response: RitualResponse) {
    return this.repository.save(response);
  }

  findBySessionAndUser(sessionId: string, userId: string) {
    return this.repository.findOne({
      where: {
        sessionId,
        userId,
      },
    });
  }

  listBySession(sessionId: string) {
    return this.repository.find({
      where: { sessionId },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });
  }
}
