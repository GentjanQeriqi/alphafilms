import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Session } from '../database/entities/session.entity';
import { Photo } from '../database/entities/photo.entity';
import * as fs from 'fs';
import * as path from 'path';

export interface CreateSessionDto {
  name: string;
  type?: string;
  expiresAt?: string | null;
}

export interface UpdateSessionDto {
  name?: string;
  status?: 'active' | 'expired' | 'deleted';
  expiresAt?: string | null;
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(Photo)
    private readonly photoRepo: Repository<Photo>,
  ) {}

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 30);
    const suffix = uuidv4().split('-')[0];
    return `${base}-${suffix}`;
  }

  async findAllByUser(userId: string): Promise<Session[]> {
    const sessions = await this.sessionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: [],
    });

    const withCounts = await Promise.all(
      sessions.map(async (s) => {
        const photoCount = await this.photoRepo.countBy({ sessionId: s.id });
        return { ...s, photoCount };
      }),
    );

    return withCounts as any;
  }

  async findById(id: string, userId?: string): Promise<Session> {
    const session = await this.sessionRepo.findOneBy({ id });
    if (!session) throw new NotFoundException('Session not found');
    if (userId && session.userId !== userId) {
      throw new ForbiddenException('Not your session');
    }
    return session;
  }

  async findBySlug(slug: string): Promise<Session> {
    const session = await this.sessionRepo.findOneBy({ slug });
    if (!session || session.status === 'deleted') {
      throw new NotFoundException('Session not found or expired');
    }
    return session;
  }

  async create(userId: string, dto: CreateSessionDto): Promise<Session> {
    const session = this.sessionRepo.create({
      name: dto.name,
      slug: this.generateSlug(dto.name),
      userId,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      status: 'active',
    });
    return this.sessionRepo.save(session);
  }

  async update(id: string, userId: string, dto: UpdateSessionDto): Promise<Session> {
    const session = await this.findById(id, userId);
    Object.assign(session, {
      ...(dto.name && { name: dto.name }),
      ...(dto.status && { status: dto.status }),
      ...(dto.expiresAt !== undefined && {
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      }),
    });
    return this.sessionRepo.save(session);
  }

  async delete(id: string, userId: string): Promise<void> {
    const session = await this.findById(id, userId);
    await this.cleanupSessionFiles(session);
    await this.sessionRepo.remove(session);
  }

  async cleanupExpired(): Promise<number> {
    const expired = await this.sessionRepo.find({
      where: {
        status: 'active',
        expiresAt: LessThan(new Date()),
      },
    });

    for (const session of expired) {
      await this.cleanupSessionFiles(session);
      await this.sessionRepo.remove(session);
    }

    return expired.length;
  }

  private async cleanupSessionFiles(session: Session): Promise<void> {
    const uploadsDir = path.join(process.cwd(), 'uploads', `session-${session.slug}`);
    if (fs.existsSync(uploadsDir)) {
      fs.rmSync(uploadsDir, { recursive: true, force: true });
    }
  }
}
