import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // read from the loaded configuration shape: configuration.ts exposes jwt.refreshSecret
      secretOrKey: config.get<string>('jwt.refreshSecret'),
    });
  }

  validate(payload: any) {
    return payload;
  }
}
