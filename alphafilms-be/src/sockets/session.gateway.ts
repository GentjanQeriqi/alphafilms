import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: '/session',
  cors: { origin: '*' },
})
export class SessionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string;
      if (token) {
        this.jwtService.verify(token);
      }
    } catch {
      // Public clients (gallery guests) connect without auth
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('join-session')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    client.join(data.sessionId);
  }

  @SubscribeMessage('leave-session')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    client.leave(data.sessionId);
  }

  emitPhotoAdded(sessionId: string, photo: any) {
    this.server.to(sessionId).emit('photo-added', { sessionId, photo });
  }

  emitPhotoRemoved(sessionId: string, photoId: string) {
    this.server.to(sessionId).emit('photo-removed', { sessionId, photoId });
  }
}
