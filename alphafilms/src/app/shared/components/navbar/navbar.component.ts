import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar__inner">
        <!-- Logo -->
        <a routerLink="/dashboard" class="navbar__logo">
          <img
            src="/icons/653808452_18389039152157499_337970551999006012_n.jpg"
            alt="AlphaFilms"
            class="navbar__logo-img"
          />
          <span class="navbar__logo-text">AlphaFilms</span>
        </a>

        <!-- Nav Links -->
        <div class="navbar__links">
          <a routerLink="/dashboard" routerLinkActive="navbar__link--active" class="navbar__link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            {{ i18n.t().nav_sessions }}
          </a>
        </div>

        <!-- Right side -->
        <div class="navbar__right">

          <!-- Language toggle -->
          <button class="lang-toggle" (click)="i18n.toggle()" [title]="i18n.lang() === 'sq' ? 'Switch to English' : 'Kalo në Shqip'">
            <span class="lang-toggle__active">{{ i18n.lang() === 'sq' ? 'SQ' : 'EN' }}</span>
            <span class="lang-toggle__sep">/</span>
            <span class="lang-toggle__inactive">{{ i18n.lang() === 'sq' ? 'EN' : 'SQ' }}</span>
          </button>

          <!-- User -->
          @if (auth.user(); as user) {
            <div class="navbar__user-info">
              @if (user.avatar) {
                <img [src]="user.avatar" [alt]="user.name" class="navbar__avatar" />
              } @else {
                <div class="navbar__avatar navbar__avatar--fallback">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
              }
              <span class="navbar__user-name">{{ user.name }}</span>
            </div>

            <button class="navbar__logout" (click)="auth.logout()" [title]="i18n.t().nav_sign_out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: var(--z-base);
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-default);
    }

    .navbar__inner {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      height: 60px;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--space-6);
    }

    .navbar__logo {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      text-decoration: none;
      flex-shrink: 0;
    }

    .navbar__logo-img {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }

    .navbar__logo-text {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .navbar__links {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex: 1;
    }

    .navbar__link {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
      transition: all var(--transition-base);
      text-decoration: none;
      cursor: pointer;

      svg { flex-shrink: 0; }

      &:hover {
        color: var(--text-primary);
        background: var(--bg-secondary);
      }

      &--active {
        color: var(--text-primary);
        background: var(--bg-secondary);
        font-weight: var(--font-weight-semibold);
      }
    }

    .navbar__right {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-left: auto;
    }

    /* Language toggle */
    .lang-toggle {
      display: flex;
      align-items: center;
      gap: 3px;
      padding: var(--space-1) var(--space-3);
      height: 30px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-full);
      background: transparent;
      font-family: var(--font-family);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-base);
      letter-spacing: 0.04em;

      &:hover {
        border-color: var(--border-strong);
        background: var(--bg-secondary);
      }
    }

    .lang-toggle__active {
      color: var(--text-primary);
    }

    .lang-toggle__sep {
      color: var(--text-muted);
      font-weight: var(--font-weight-regular);
    }

    .lang-toggle__inactive {
      color: var(--text-muted);
    }

    .navbar__user-info {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .navbar__user-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);

      @media (max-width: 640px) { display: none; }
    }

    .navbar__avatar {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--border-default);
      object-fit: cover;
      flex-shrink: 0;

      &--fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-gray-900);
        color: var(--color-white);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-bold);
      }
    }

    .navbar__logout {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      color: var(--text-muted);
      transition: all var(--transition-base);
      cursor: pointer;

      &:hover {
        color: var(--text-primary);
        background: var(--bg-secondary);
      }
    }
  `],
})
export class NavbarComponent {
  auth = inject(AuthService);
  i18n = inject(I18nService);
}
