import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Session, CreateSessionDto, UpdateSessionDto } from '../models/session.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get headers() {
    return { headers: this.auth.authHeaders };
  }

  getAll(): Observable<Session[]> {
    return this.http.get<Session[]>(`${environment.apiUrl}/sessions`, this.headers);
  }

  getById(id: string): Observable<Session> {
    return this.http.get<Session>(`${environment.apiUrl}/sessions/${id}`, this.headers);
  }

  getPublicBySlug(slug: string): Observable<Session> {
    return this.http.get<Session>(`${environment.apiUrl}/public/session/${slug}`);
  }

  create(dto: CreateSessionDto): Observable<Session> {
    return this.http.post<Session>(`${environment.apiUrl}/sessions`, dto, this.headers);
  }

  update(id: string, dto: UpdateSessionDto): Observable<Session> {
    return this.http.patch<Session>(`${environment.apiUrl}/sessions/${id}`, dto, this.headers);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/sessions/${id}`, this.headers);
  }
}
