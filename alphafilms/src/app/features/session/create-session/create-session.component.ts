import { Component, inject, signal, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../../core/services/session.service';
import { Session, SessionType } from '../../../core/models/session.model';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-create-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal animate-scale-in" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="modal__header">
          <div>
            <h2 class="modal__title">{{ i18n.t().create_title }}</h2>
            <p class="modal__subtitle">{{ i18n.t().create_subtitle }}</p>
          </div>
          <button class="modal__close" (click)="close.emit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="submit()" #form="ngForm">

          <!-- Session Name -->
          <div class="form-group">
            <label class="form-label" for="name">{{ i18n.t().create_name_label }}</label>
            <input
              id="name"
              class="form-input"
              type="text"
              [placeholder]="i18n.t().create_name_placeholder"
              [(ngModel)]="name"
              name="name"
              required
              maxlength="80"
            />
          </div>

          <!-- Session Type -->
          <div class="form-group">
            <label class="form-label">{{ i18n.t().create_type_label }}</label>
            <div class="type-grid">
              @for (type of sessionTypes(); track type.value) {
                <button
                  type="button"
                  class="type-btn"
                  [class.type-btn--selected]="selectedType === type.value"
                  (click)="selectedType = type.value"
                >
                  {{ type.label }}
                </button>
              }
            </div>
          </div>

          <!-- Expiry -->
          <div class="form-group">
            <label class="form-label" for="expires">{{ i18n.t().create_expires_label }}</label>
            <input
              id="expires"
              class="form-input"
              type="datetime-local"
              [(ngModel)]="expiresAt"
              name="expiresAt"
            />
            <span class="form-hint">{{ i18n.t().create_expires_hint }}</span>
          </div>

          <!-- Error -->
          @if (error()) {
            <div class="form-error">{{ error() }}</div>
          }

          <!-- Actions -->
          <div class="modal__actions">
            <button type="button" class="btn-ghost" (click)="close.emit()">
              {{ i18n.t().cancel }}
            </button>
            <button type="submit" class="btn-primary" [disabled]="!name.trim() || loading()">
              @if (loading()) {
                <div class="btn-spinner"></div>
                {{ i18n.t().create_creating }}
              } @else {
                {{ i18n.t().create_btn }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      padding: var(--space-4);
    }

    .modal {
      background: var(--bg-primary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      padding: var(--space-8);
      width: 100%;
      max-width: 480px;
      box-shadow: var(--shadow-xl);

      @media (max-width: 520px) {
        padding: var(--space-6);
      }
    }

    .modal__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-6);
      gap: var(--space-4);
    }

    .modal__title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      letter-spacing: -0.03em;
      color: var(--text-primary);
    }

    .modal__subtitle {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin-top: var(--space-1);
      line-height: var(--line-height-snug);
    }

    .modal__close {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      color: var(--text-muted);
      cursor: pointer;
      flex-shrink: 0;
      transition: all var(--transition-base);

      &:hover { background: var(--bg-secondary); color: var(--text-primary); }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-5);
    }

    .form-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .form-input {
      height: 44px;
      padding: 0 var(--space-4);
      background: var(--bg-primary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      color: var(--text-primary);
      transition: border-color var(--transition-fast);
      width: 100%;

      &::placeholder { color: var(--text-muted); }

      &:focus {
        outline: none;
        border-color: var(--color-black);
        box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
      }
    }

    .form-hint {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }

    .form-error {
      padding: var(--space-3) var(--space-4);
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      color: #DC2626;
      margin-bottom: var(--space-4);
    }

    .type-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-2);

      @media (max-width: 400px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .type-btn {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      font-family: var(--font-family);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: center;

      &:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }

      &--selected {
        background: var(--color-black);
        border-color: var(--color-black);
        color: var(--color-white);
        font-weight: var(--font-weight-semibold);
      }
    }

    .modal__actions {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
      margin-top: var(--space-6);
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0 var(--space-6);
      height: 44px;
      background: var(--color-black);
      color: var(--color-white);
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover:not(:disabled) { background: var(--color-gray-800); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      padding: 0 var(--space-5);
      height: 44px;
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover { background: var(--bg-secondary); }
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
  `],
})
export class CreateSessionComponent {
  private sessionService = inject(SessionService);
  i18n = inject(I18nService);

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<Session>();

  name = '';
  selectedType: SessionType = 'Wedding';
  expiresAt = '';
  loading = signal(false);
  error = signal<string | null>(null);

  sessionTypes = computed(() => [
    { value: 'Wedding' as SessionType,        label: this.i18n.t().type_wedding },
    { value: 'Birthday' as SessionType,       label: this.i18n.t().type_birthday },
    { value: 'Corporate Event' as SessionType,label: this.i18n.t().type_corporate },
    { value: 'Graduation' as SessionType,     label: this.i18n.t().type_graduation },
    { value: 'Family Session' as SessionType, label: this.i18n.t().type_family },
    { value: 'Other' as SessionType,          label: this.i18n.t().type_other },
  ]);

  submit(): void {
    if (!this.name.trim() || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.sessionService
      .create({
        name: this.name.trim(),
        type: this.selectedType,
        expiresAt: this.expiresAt || null,
      })
      .subscribe({
        next: (session) => {
          this.loading.set(false);
          this.created.emit(session);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'Failed to create session');
        },
      });
  }
}
