import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private isBrowser = isPlatformBrowser(this.platformId);

  private _user = signal<User | null>(null);
  private _token = signal<string | null>(
    this.isBrowser ? localStorage.getItem('af_token') : null
  );
  private _loading = signal(false);

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token() && !!this._user());

  get authHeaders() {
    return { Authorization: `Bearer ${this._token()}` };
  }

  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  handleCallback(token: string): void {
    this._token.set(token);
    if (this.isBrowser) localStorage.setItem('af_token', token);
    this.loadProfile().subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }

  loadProfile() {
    if (!this._token()) return of(null);
    this._loading.set(true);
    return this.http
      .get<User>(`${environment.apiUrl}/auth/profile`, {
        headers: this.authHeaders,
      })
      .pipe(
        tap((user) => {
          this._user.set(user);
          this._loading.set(false);
        }),
        catchError(() => {
          this.logout();
          return of(null);
        })
      );
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    if (this.isBrowser) localStorage.removeItem('af_token');
    this.router.navigate(['/login']);
  }
}
