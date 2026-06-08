import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export interface PhotoAddedEvent {
  sessionId: string;
  photo: any;
}

export interface PhotoRemovedEvent {
  sessionId: string;
  photoId: string;
}

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private destroy$ = new Subject<void>();

  connect(token?: string): void {
    if (this.socket?.connected) return;

    const opts: any = {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    };

    if (token) {
      opts.auth = { token };
    }

    this.socket = io(`${environment.wsUrl}/session`, opts);
  }

  joinSession(sessionId: string): void {
    this.socket?.emit('join-session', { sessionId });
  }

  leaveSession(sessionId: string): void {
    this.socket?.emit('leave-session', { sessionId });
  }

  onPhotoAdded(): Observable<PhotoAddedEvent> {
    return new Observable((observer) => {
      this.socket?.on('photo-added', (data: PhotoAddedEvent) => {
        observer.next(data);
      });
      return () => this.socket?.off('photo-added');
    });
  }

  onPhotoRemoved(): Observable<PhotoRemovedEvent> {
    return new Observable((observer) => {
      this.socket?.on('photo-removed', (data: PhotoRemovedEvent) => {
        observer.next(data);
      });
      return () => this.socket?.off('photo-removed');
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
