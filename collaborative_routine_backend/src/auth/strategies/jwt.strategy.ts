import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // read from the loaded configuration shape: configuration.ts exposes jwt.secret
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  validate(payload: any) {
    return payload;
  }
}
