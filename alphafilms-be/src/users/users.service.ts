import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  async upsertFromGoogle(profile: {
    email: string;
    name: string;
    avatar?: string;
  }): Promise<User> {
    let user = await this.findByEmail(profile.email);
    if (!user) {
      user = this.repo.create(profile);
    } else {
      user.name = profile.name;
      if (profile.avatar) user.avatar = profile.avatar;
    }
    return this.repo.save(user);
  }
}
