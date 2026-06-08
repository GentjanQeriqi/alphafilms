import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from '../database/entities/photo.entity';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private readonly repo: Repository<Photo>,
  ) {}

  async findBySession(sessionId: string): Promise<Photo[]> {
    return this.repo.find({
      where: { sessionId },
      order: { uploadedAt: 'DESC' },
    });
  }

  async processAndSave(
    sessionId: string,
    sessionSlug: string,
    file: Express.Multer.File,
  ): Promise<Photo> {
    const sessionDir = path.join(
      process.cwd(), 'uploads', `session-${sessionSlug}`,
    );
    const originalDir = path.join(sessionDir, 'original');
    const webDir = path.join(sessionDir, 'web');

    fs.mkdirSync(originalDir, { recursive: true });
    fs.mkdirSync(webDir, { recursive: true });

    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

    const originalPath = path.join(originalDir, baseName);
    const webPath = path.join(webDir, baseName);

    fs.writeFileSync(originalPath, file.buffer);

    const metadata = await sharp(file.buffer).metadata();

    await sharp(file.buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(webPath.replace(ext, '.jpg'));

    const webFilename = baseName.replace(ext, '.jpg');

    const photo = this.repo.create({
      sessionId,
      filename: file.originalname,
      originalPath: `uploads/session-${sessionSlug}/original/${baseName}`,
      webPath: `uploads/session-${sessionSlug}/web/${webFilename}`,
      size: file.size,
      width: metadata.width,
      height: metadata.height,
    });

    return this.repo.save(photo);
  }

  async delete(id: string): Promise<{ id: string; sessionId: string }> {
    const photo = await this.repo.findOneBy({ id });
    if (!photo) throw new NotFoundException('Photo not found');

    const deleteFile = (p: string) => {
      const full = path.join(process.cwd(), p);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    };

    deleteFile(photo.originalPath);
    deleteFile(photo.webPath);

    const { id: photoId, sessionId } = photo;
    await this.repo.remove(photo);
    return { id: photoId, sessionId };
  }
}
