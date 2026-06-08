import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SessionsModule } from './sessions/sessions.module';
import { PhotosModule } from './photos/photos.module';
import { SocketsModule } from './sockets/sockets.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { PublicController } from './common/public.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    SessionsModule,
    PhotosModule,
    SocketsModule,
    CleanupModule,
  ],
  controllers: [PublicController],
})
export class AppModule {}
