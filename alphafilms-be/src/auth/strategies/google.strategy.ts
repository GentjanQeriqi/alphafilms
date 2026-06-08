import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const callbackURL =
      config.get<string>('GOOGLE_CALLBACK_URL') ||
      process.env.GOOGLE_CALLBACK_URL ||
      'https://alphafilms.studio/api/v1/auth/google/callback';

    super({
      clientID:
        config.get<string>('GOOGLE_CLIENT_ID') || process.env.GOOGLE_CLIENT_ID,
      clientSecret:
        config.get<string>('GOOGLE_CLIENT_SECRET') ||
        process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(_access: string, _refresh: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;
    const avatar = profile.photos?.[0]?.value;
    return this.usersService.upsertFromGoogle({ email, name, avatar });
  }
}
