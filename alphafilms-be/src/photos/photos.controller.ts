import {
  Controller, Get, Post, Delete,
  Param, Req, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PhotosService } from './photos.service';
import { SessionsService } from '../sessions/sessions.service';

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 25 * 1024 * 1024;

@Controller()
@UseGuards(AuthGuard('jwt'))
export class PhotosController {
  constructor(
    private readonly photosService: PhotosService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Get('sessions/:sessionId/photos')
  findAll(@Param('sessionId') sessionId: string) {
    return this.photosService.findBySession(sessionId);
  }

  @Post('sessions/:sessionId/photos')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('File type not allowed'), false);
        }
      },
    }),
  )
  async upload(
    @Param('sessionId') sessionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    const session = await this.sessionsService.findById(sessionId, req.user.id);
    return this.photosService.processAndSave(sessionId, session.slug, file);
  }

  @Delete('photos/:id')
  remove(@Param('id') id: string) {
    return this.photosService.delete(id);
  }
}
