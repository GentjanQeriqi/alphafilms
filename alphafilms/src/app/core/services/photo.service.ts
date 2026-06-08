import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable, map, filter } from 'rxjs';
import { AuthService } from './auth.service';
import { Photo } from '../models/photo.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get headers() {
    return { headers: this.auth.authHeaders };
  }

  getBySession(sessionId: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(
      `${environment.apiUrl}/sessions/${sessionId}/photos`,
      this.headers
    );
  }

  getPublicBySlug(slug: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(
      `${environment.apiUrl}/public/session/${slug}/photos`
    );
  }

  uploadPhoto(sessionId: string, file: File): Observable<{ progress: number; photo?: Photo }> {
    const formData = new FormData();
    formData.append('file', file);

    const authHeaders = this.auth.authHeaders;
    const httpHeaders = new HttpHeaders({ Authorization: authHeaders['Authorization'] });

    const req = new HttpRequest(
      'POST',
      `${environment.apiUrl}/sessions/${sessionId}/photos`,
      formData,
      {
        headers: httpHeaders,
        reportProgress: true,
      }
    );

    return this.http.request(req).pipe(
      filter(
        (e) =>
          e.type === HttpEventType.UploadProgress ||
          e.type === HttpEventType.Response
      ),
      map((e) => {
        if (e.type === HttpEventType.UploadProgress) {
          const progress = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
          return { progress };
        }
        return { progress: 100, photo: (e as any).body as Photo };
      })
    );
  }

  delete(photoId: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/photos/${photoId}`,
      this.headers
    );
  }
}
