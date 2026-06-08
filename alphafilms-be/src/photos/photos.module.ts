import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from '../database/entities/photo.entity';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Photo]), SessionsModule],
  providers: [PhotosService],
  controllers: [PhotosController],
  exports: [PhotosService],
})
export class PhotosModule {}
