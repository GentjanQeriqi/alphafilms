import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';
import { SessionService } from '../../core/services/session.service';
import { AuthService } from '../../core/services/auth.service';
import { Session } from '../../core/models/session.model';
import { SessionCardComponent } from './components/session-card/session-card.component';
import { CreateSessionComponent } from '../session/create-session/create-session.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SessionCardComponent, CreateSessionComponent],
  template: `
    <div class="dashboard">
      <div class="container">

        <!-- Header -->
        <div class="dashboard__header animate-fade-in">
          <div class="dashboard__title-group">
            <h1 class="dashboard__title">{{ i18n.t().dash_title }}</h1>
            <p class="dashboard__subtitle">
              {{ sessions().length === 1 ? i18n.t().dash_session_count_one : i18n.p('dash_session_count_many', {n: sessions().length}) }}
            </p>
          </div>
          <button class="btn-primary" (click)="showCreate.set(true)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ i18n.t().dash_new_session }}
          </button>
        </div>

        <!-- Filter Tabs -->
        <div class="dashboard__filters animate-fade-in" style="animation-delay: 50ms">
          @for (tab of filterTabs(); track tab.value) {
            <button
              class="dashboard__filter-tab"
              [class.dashboard__filter-tab--active]="activeFilter() === tab.value"
              (click)="activeFilter.set(tab.value)"
            >
              {{ tab.label }}
              <span class="dashboard__filter-count">{{ countByStatus(tab.value) }}</span>
            </button>
          }
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="dashboard__loading">
            <div class="spinner"></div>
          </div>
        }

        <!-- Sessions Grid -->
        @if (!loading()) {
          @if (filteredSessions().length > 0) {
            <div class="dashboard__grid animate-fade-in" style="animation-delay: 100ms">
              @for (session of filteredSessions(); track session.id) {
                <app-session-card
                  [session]="session"
                  (delete)="deleteSession($event)"
                />
              }
            </div>
          } @else {
            <!-- Empty State -->
            <div class="dashboard__empty animate-scale-in">
              <div class="dashboard__empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h3 class="dashboard__empty-title">{{ i18n.t().dash_empty_title }}</h3>
              <p class="dashboard__empty-desc">{{ i18n.t().dash_empty_desc }}</p>
              <button class="btn-primary" (click)="showCreate.set(true)">
                {{ i18n.t().dash_create_session }}
              </button>
            </div>
          }
        }

      </div>
    </div>

    <!-- Create Modal -->
    @if (showCreate()) {
      <app-create-session
        (close)="showCreate.set(false)"
        (created)="onSessionCreated($event)"
      />
    }

    <!-- Delete Confirm Modal -->
    @if (sessionToDelete()) {
      <div class="modal-overlay" (click)="sessionToDelete.set(null)">
        <div class="modal animate-scale-in" (click)="$event.stopPropagation()">
          <h3 class="modal__title">{{ i18n.t().delete_title }}</h3>
          <p class="modal__desc">{{ i18n.t().delete_desc }}</p>
          <div class="modal__actions">
            <button class="btn-ghost" (click)="sessionToDelete.set(null)">{{ i18n.t().cancel }}</button>
            <button class="btn-danger" (click)="confirmDelete()" [disabled]="deleting()">
              {{ deleting() ? i18n.t().delete_deleting : i18n.t().delete_confirm }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dashboard {
      padding: var(--space-10) 0 var(--space-16);
    }

    .dashboard__header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: var(--space-8);
      gap: var(--space-4);

      @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .dashboard__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-extrabold);
      letter-spacing: -0.04em;
      color: var(--text-primary);
      line-height: 1;
    }

    .dashboard__subtitle {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
      margin-top: var(--space-1);
    }

    .dashboard__filters {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      margin-bottom: var(--space-6);
      border-bottom: 1px solid var(--border-default);
    }

    .dashboard__filter-tab {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      border: none;
      background: none;
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-base);
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;

      &:hover { color: var(--text-secondary); }

      &--active {
        color: var(--text-primary);
        border-bottom-color: var(--color-black);
      }
    }

    .dashboard__filter-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background: var(--color-gray-100);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--text-secondary);
    }

    .dashboard__loading {
      display: flex;
      justify-content: center;
      padding: var(--space-16) 0;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid var(--color-gray-200);
      border-top-color: var(--color-black);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .dashboard__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-4);
    }

    .dashboard__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-20) 0;
      text-align: center;
      gap: var(--space-4);
    }

    .dashboard__empty-icon {
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      color: var(--text-muted);
    }

    .dashboard__empty-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      letter-spacing: -0.02em;
    }

    .dashboard__empty-desc {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      max-width: 280px;
      line-height: var(--line-height-base);
    }

    /* Shared buttons */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-5);
      height: 40px;
      background: var(--color-black);
      color: var(--color-white);
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-base);
      white-space: nowrap;

      svg { flex-shrink: 0; }

      &:hover { background: var(--color-gray-800); }
    }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      padding: var(--space-2) var(--space-4);
      height: 38px;
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover { background: var(--bg-secondary); border-color: var(--border-strong); }
    }

    .btn-danger {
      display: inline-flex;
      align-items: center;
      padding: var(--space-2) var(--space-4);
      height: 38px;
      background: #EF4444;
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover:not(:disabled) { background: #DC2626; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    /* Modal */
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
      max-width: 400px;
      box-shadow: var(--shadow-xl);
    }

    .modal__title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      letter-spacing: -0.02em;
      margin-bottom: var(--space-3);
    }

    .modal__desc {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: var(--line-height-base);
      margin-bottom: var(--space-6);
    }

    .modal__actions {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
    }
  `],
})
export class DashboardComponent implements OnInit {
  private sessionService = inject(SessionService);
  auth = inject(AuthService);
  i18n = inject(I18nService);

  sessions = signal<Session[]>([]);
  loading = signal(true);
  showCreate = signal(false);
  sessionToDelete = signal<string | null>(null);
  deleting = signal(false);
  activeFilter = signal<string>('all');

  filterTabs = computed(() => [
    { label: this.i18n.t().dash_filter_all, value: 'all' },
    { label: this.i18n.t().dash_filter_active, value: 'active' },
    { label: this.i18n.t().dash_filter_expired, value: 'expired' },
  ]);

  filteredSessions() {
    const filter = this.activeFilter();
    if (filter === 'all') return this.sessions();
    return this.sessions().filter((s) => s.status === filter);
  }

  countByStatus(status: string): number {
    if (status === 'all') return this.sessions().length;
    return this.sessions().filter((s) => s.status === status).length;
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading.set(true);
    this.sessionService.getAll().subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  deleteSession(id: string): void {
    this.sessionToDelete.set(id);
  }

  confirmDelete(): void {
    const id = this.sessionToDelete();
    if (!id) return;
    this.deleting.set(true);
    this.sessionService.delete(id).subscribe({
      next: () => {
        this.sessions.update((s) => s.filter((x) => x.id !== id));
        this.sessionToDelete.set(null);
        this.deleting.set(false);
      },
      error: () => this.deleting.set(false),
    });
  }

  onSessionCreated(session: Session): void {
    this.sessions.update((s) => [session, ...s]);
    this.showCreate.set(false);
  }
}
