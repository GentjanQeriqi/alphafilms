import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from '../database/entities/photo.entity';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { SocketsModule } from '../sockets/sockets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Photo]), SessionsModule, SocketsModule],
  providers: [PhotosService],
  controllers: [PhotosController],
  exports: [PhotosService],
})
export class PhotosModule {}
