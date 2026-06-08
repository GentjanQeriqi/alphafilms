import { Controller, Get, Param } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { PhotosService } from '../photos/photos.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly photosService: PhotosService,
  ) {}

  @Get('session/:slug')
  getSession(@Param('slug') slug: string) {
    return this.sessionsService.findBySlug(slug);
  }

  @Get('session/:slug/photos')
  async getPhotos(@Param('slug') slug: string) {
    const session = await this.sessionsService.findBySlug(slug);
    return this.photosService.findBySession(session.id);
  }
}
