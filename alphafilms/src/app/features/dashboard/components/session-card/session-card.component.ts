import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Session } from '../../../../core/models/session.model';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-session-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="session-card" [class.session-card--expired]="session.status === 'expired'">
      <!-- Status badge -->
      <div class="session-card__header">
        <span class="session-card__badge" [class]="'session-card__badge--' + session.status">
          {{ session.status === 'active' ? i18n.t().card_status_active : session.status === 'expired' ? i18n.t().card_status_expired : i18n.t().card_status_deleted }}
        </span>
        <span class="session-card__date">
          {{ session.createdAt | date:'MMM d, y' }}
        </span>
      </div>

      <!-- Content -->
      <div class="session-card__body">
        <h3 class="session-card__name">{{ session.name }}</h3>
        <p class="session-card__slug">{{ session.slug }}</p>

        @if (session.photoCount !== undefined) {
          <p class="session-card__photos">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            {{ session.photoCount === 1 ? i18n.t().card_photos_one : i18n.p('card_photos_many', {n: session.photoCount}) }}
          </p>
        }

        @if (session.expiresAt) {
          <p class="session-card__expires" [class.session-card__expires--soon]="isExpiringSoon()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ i18n.t().card_expires }} {{ session.expiresAt | date:'MMM d' }}
          </p>
        }
      </div>

      <!-- Actions -->
      <div class="session-card__footer">
        <a
          [routerLink]="['/sessions', session.id]"
          class="session-card__btn session-card__btn--primary"
        >
          {{ i18n.t().card_open }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
        <button
          class="session-card__btn session-card__btn--danger"
          (click)="onDelete()"
          title="Delete session"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .session-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      transition: all var(--transition-base);
      cursor: default;

      &:hover {
        border-color: var(--border-strong);
        box-shadow: var(--shadow-md);
      }

      &--expired {
        opacity: 0.6;
      }
    }

    .session-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .session-card__badge {
      display: inline-flex;
      align-items: center;
      padding: 2px var(--space-2);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.05em;

      &--active {
        background: var(--color-gray-900);
        color: var(--color-white);
      }

      &--expired {
        background: var(--color-gray-200);
        color: var(--color-gray-600);
      }

      &--deleted {
        background: var(--color-gray-100);
        color: var(--color-gray-400);
      }
    }

    .session-card__date {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }

    .session-card__body {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      flex: 1;
    }

    .session-card__name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      letter-spacing: -0.01em;
      line-height: var(--line-height-snug);
    }

    .session-card__slug {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      font-family: 'SF Mono', 'Fira Code', monospace;
      margin-top: 2px;
    }

    .session-card__photos,
    .session-card__expires {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      margin-top: var(--space-2);

      svg { flex-shrink: 0; }
    }

    .session-card__expires--soon {
      color: #B45309;
    }

    .session-card__footer {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding-top: var(--space-3);
      border-top: 1px solid var(--border-default);
    }

    .session-card__btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-base);
      text-decoration: none;
      border: none;

      &--primary {
        flex: 1;
        justify-content: center;
        background: var(--color-black);
        color: var(--color-white);

        &:hover {
          background: var(--color-gray-800);
        }
      }

      &--danger {
        background: transparent;
        color: var(--text-muted);
        border: 1px solid var(--border-default);

        &:hover {
          border-color: #EF4444;
          color: #EF4444;
          background: #FEF2F2;
        }
      }
    }
  `],
})
export class SessionCardComponent {
  @Input({ required: true }) session!: Session;
  @Output() delete = new EventEmitter<string>();
  i18n = inject(I18nService);

  onDelete(): void {
    this.delete.emit(this.session.id);
  }

  isExpiringSoon(): boolean {
    if (!this.session.expiresAt) return false;
    const diff = new Date(this.session.expiresAt).getTime() - Date.now();
    return diff < 72 * 60 * 60 * 1000;
  }
}
