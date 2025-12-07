import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, timezone } = registerDto;

    try {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      const hashedPassword = await this.hashPassword(password);

      const user = this.userRepository.create({
        email,
        passwordHash: hashedPassword,
        name,
        timezone,
      });

      await this.userRepository.save(user);

      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error: any) {
      if (
        error instanceof QueryFailedError ||
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Unable to register user');
    }
  }

  async login(loginDto: LoginDto) {
    // avoid logging sensitive fields
    const { email, password } = loginDto;
    try {
      const user = await this.validateUser(email, password);

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
      };

      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: { id: true, email: true, passwordHash: true },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user;
    } catch (error: any) {
      console.error(error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to validate user');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = 10;
      const hashed = await bcrypt.hash(password, saltRounds);
      return hashed;
    } catch {
      throw new InternalServerErrorException('Failed to hash password');
    }
  }
}
