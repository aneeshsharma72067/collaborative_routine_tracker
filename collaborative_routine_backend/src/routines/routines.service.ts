import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutineBlock } from './entities/routine-block.entity';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(RoutineBlock)
    private readonly blocks: Repository<RoutineBlock>,
  ) {}
}
