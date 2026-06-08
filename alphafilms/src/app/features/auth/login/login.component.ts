import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login">
      <div class="login__card animate-scale-in">

        <!-- Logo -->
        <div class="login__brand">
          <img
            src="/icons/653808452_18389039152157499_337970551999006012_n.jpg"
            alt="AlphaFilms"
            class="login__logo"
          />
        </div>

        <!-- Headline -->
        <div class="login__header">
          <h1 class="login__title">{{ i18n.t().auth_title }}</h1>
          <p class="login__subtitle" [innerHTML]="i18n.t().auth_subtitle.replace('\\n', '<br>')"></p>
        </div>

        <!-- Divider -->
        <div class="login__divider">
          <span>{{ i18n.t().auth_sign_in }}</span>
        </div>

        <!-- Google Button -->
        <button
          class="login__google-btn"
          (click)="loginWithGoogle()"
          [disabled]="loading"
        >
          @if (loading) {
            <div class="login__spinner"></div>
            <span>{{ i18n.t().auth_signing_in }}</span>
          } @else {
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{{ i18n.t().auth_google_btn }}</span>
          }
        </button>

        <!-- Features -->
        <ul class="login__features">
          <li>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{{ i18n.t().auth_feat_sessions }}</span>
          </li>
          <li>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{{ i18n.t().auth_feat_qr }}</span>
          </li>
          <li>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{{ i18n.t().auth_feat_live }}</span>
          </li>
        </ul>

        <!-- Disclaimer -->
        <p class="login__disclaimer">
          {{ i18n.t().auth_disclaimer }}
          <a href="#">{{ i18n.t().auth_terms }}</a> {{ i18n.lang() === 'sq' ? 'dhe' : 'and' }} <a href="#">{{ i18n.t().auth_privacy }}</a>.
        </p>
      </div>

      <!-- Background grid -->
      <div class="login__bg" aria-hidden="true">
        <div class="login__grid"></div>
      </div>
    </div>
  `,
  styles: [`
    .login {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
      position: relative;
      overflow: hidden;
    }

    .login__bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .login__grid {
      width: 100%;
      height: 100%;
      background-image:
        linear-gradient(var(--color-gray-100) 1px, transparent 1px),
        linear-gradient(90deg, var(--color-gray-100) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.6;
    }

    .login__card {
      position: relative;
      z-index: 1;
      background: var(--bg-primary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      padding: var(--space-12) var(--space-10);
      width: 100%;
      max-width: 400px;
      box-shadow: var(--shadow-xl);

      @media (max-width: 480px) {
        padding: var(--space-8) var(--space-6);
        border-radius: var(--radius-lg);
      }
    }

    .login__brand {
      display: flex;
      justify-content: center;
      margin-bottom: var(--space-6);
    }

    .login__logo {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-md);
      object-fit: cover;
      border: 1px solid var(--border-default);
    }

    .login__header {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .login__title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
      letter-spacing: -0.04em;
      color: var(--text-primary);
      margin-bottom: var(--space-2);
    }

    .login__subtitle {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: var(--line-height-base);
    }

    .login__divider {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin-bottom: var(--space-5);

      &::before,
      &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--border-default);
      }

      span {
        font-size: var(--font-size-xs);
        color: var(--text-muted);
        white-space: nowrap;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
    }

    .login__google-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      width: 100%;
      height: 48px;
      background: var(--color-black);
      color: var(--color-white);
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-base);
      letter-spacing: 0.01em;
      margin-bottom: var(--space-6);

      svg { flex-shrink: 0; }

      &:hover:not(:disabled) {
        background: var(--color-gray-800);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .login__spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .login__features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-6);

      li {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-xs);
        color: var(--text-secondary);

        svg { flex-shrink: 0; color: var(--text-muted); }
      }
    }

    .login__disclaimer {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      text-align: center;
      line-height: var(--line-height-loose);

      a {
        color: var(--text-secondary);
        text-decoration: underline;
        text-underline-offset: 2px;
        cursor: pointer;
      }
    }
  `],
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  i18n = inject(I18nService);

  loading = false;

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.loading = true;
      this.auth.handleCallback(token);
    }
  }

  loginWithGoogle(): void {
    this.loading = true;
    this.auth.loginWithGoogle();
  }
}
