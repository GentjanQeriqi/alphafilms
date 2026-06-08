import { Module } from '@nestjs/common';
import { SessionGateway } from './session.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [SessionGateway],
  exports: [SessionGateway],
})
export class SocketsModule {}
