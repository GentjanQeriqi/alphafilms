import {
  Component, inject, signal, OnInit, OnDestroy, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import QRCode from 'qrcode';
import { SessionService } from '../../../core/services/session.service';
import { PhotoService } from '../../../core/services/photo.service';
import { SocketService } from '../../../core/services/socket.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Session } from '../../../core/models/session.model';
import { Photo } from '../../../core/models/photo.model';
import { PhotoUploadComponent } from '../../upload/photo-upload/photo-upload.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PhotoUploadComponent],
  template: `
    <div class="session-detail">
      <div class="container">

        <!-- Back -->
        <a routerLink="/dashboard" class="back-link animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          {{ i18n.t().detail_back }}
        </a>

        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
          </div>
        }

        @if (!loading() && session()) {
          <!-- Header -->
          <div class="session-header animate-fade-in">
            <div class="session-header__info">
              <div class="session-header__meta">
                <span class="status-badge" [class]="'status-badge--' + session()!.status">
                  {{ session()!.status }}
                </span>
                <span class="session-date">{{ session()!.createdAt | date:'MMMM d, y' }}</span>
              </div>
              <h1 class="session-title">{{ session()!.name }}</h1>
              <p class="session-slug">/s/{{ session()!.slug }}</p>
            </div>

            <div class="session-header__actions">
              <button
                class="btn-icon"
                title="Copy gallery link"
                (click)="copyLink()"
              >
                @if (copied()) {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                } @else {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                }
                {{ copied() ? i18n.t().detail_copied : i18n.t().detail_copy }}
              </button>
            </div>
          </div>

          <!-- Main grid -->
          <div class="session-grid">

            <!-- Left: QR Code -->
            <div class="qr-panel animate-fade-in" style="animation-delay: 100ms">
              <div class="panel-header">
                <h2 class="panel-title">{{ i18n.t().detail_qr_title }}</h2>
                <p class="panel-subtitle">{{ i18n.t().detail_qr_subtitle }}</p>
              </div>

              <div class="qr-wrapper">
                @if (qrDataUrl()) {
                  <img [src]="qrDataUrl()" alt="QR Code" class="qr-img" width="200" height="200" />
                } @else {
                  <div class="qr-placeholder">
                    <div class="qr-spinner"></div>
                  </div>
                }
              </div>

              <div class="qr-url">
                <span class="qr-url__label">{{ i18n.t().detail_gallery_url }}</span>
                <a [href]="galleryUrl()" target="_blank" class="qr-url__link">
                  {{ galleryUrlDisplay() }}
                </a>
              </div>

              <button class="btn-outline qr-download" (click)="downloadQR()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {{ i18n.t().detail_download_qr }}
              </button>

              <!-- Stats -->
              <div class="session-stats">
                <div class="stat">
                  <span class="stat__value">{{ photos().length }}</span>
                  <span class="stat__label">Photos</span>
                </div>
                @if (session()!.expiresAt) {
                  <div class="stat">
                    <span class="stat__value">{{ session()!.expiresAt | date:'MMM d' }}</span>
                    <span class="stat__label">Expires</span>
                  </div>
                }
              </div>
            </div>

            <!-- Right: Photos -->
            <div class="photos-panel animate-fade-in" style="animation-delay: 150ms">
              <div class="panel-header panel-header--row">
                <div>
                  <h2 class="panel-title">{{ i18n.t().detail_photos_title }}</h2>
                  <p class="panel-subtitle">{{ photos().length }} {{ i18n.t().detail_photos_count }}</p>
                </div>
                <button class="btn-primary" (click)="showUpload.set(true)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  {{ i18n.t().detail_upload }}
                </button>
              </div>

              <!-- Photo Grid -->
              @if (photos().length > 0) {
                <div class="photo-grid">
                  @for (photo of photos(); track photo.id) {
                    <div class="photo-item" (click)="openPhoto(photo)">
                      <img
                        [src]="photoUrl(photo)"
                        [alt]="photo.filename"
                        loading="lazy"
                        class="photo-item__img"
                      />
                      <div class="photo-item__overlay">
                        <button
                          class="photo-item__delete"
                          (click)="deletePhoto(photo.id, $event)"
                          title="Delete photo"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="photos-empty">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>{{ i18n.t().detail_no_photos }}</p>
                  <span>{{ i18n.t().detail_no_photos_hint }}</span>
                </div>
              }
            </div>

          </div>
        }
      </div>
    </div>

    <!-- Upload Modal -->
    @if (showUpload() && session()) {
      <app-photo-upload
        [sessionId]="session()!.id"
        (close)="showUpload.set(false)"
        (uploaded)="onPhotosUploaded($event)"
      />
    }

    <!-- Lightbox -->
    @if (activePhoto()) {
      <div class="lightbox" (click)="activePhoto.set(null)">
        <button class="lightbox__close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <img
          [src]="photoUrl(activePhoto()!)"
          [alt]="activePhoto()!.filename"
          class="lightbox__img"
          (click)="$event.stopPropagation()"
        />
      </div>
    }
  `,
  styles: [`
    .session-detail {
      padding: var(--space-8) 0 var(--space-16);
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      color: var(--text-muted);
      margin-bottom: var(--space-8);
      cursor: pointer;
      text-decoration: none;
      transition: color var(--transition-base);

      &:hover { color: var(--text-primary); }
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: var(--space-20) 0;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid var(--color-gray-200);
      border-top-color: var(--color-black);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .session-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-8);

      @media (max-width: 640px) {
        flex-direction: column;
      }
    }

    .session-header__meta {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .status-badge {
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
        color: white;
      }
      &--expired {
        background: var(--color-gray-200);
        color: var(--color-gray-600);
      }
    }

    .session-date {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
    }

    .session-title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-extrabold);
      letter-spacing: -0.04em;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: var(--space-2);
    }

    .session-slug {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
      font-family: 'SF Mono', 'Fira Code', monospace;
    }

    .session-header__actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .btn-icon {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0 var(--space-4);
      height: 36px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      background: transparent;
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-base);
      white-space: nowrap;

      &:hover { border-color: var(--border-strong); color: var(--text-primary); }
    }

    .session-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: var(--space-6);
      align-items: start;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .qr-panel {
      background: var(--bg-primary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      position: sticky;
      top: 80px;

      @media (max-width: 900px) {
        position: static;
      }
    }

    .photos-panel {
      background: var(--bg-primary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
    }

    .panel-header {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      margin-bottom: var(--space-5);

      &--row {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .panel-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-bold);
      letter-spacing: -0.02em;
    }

    .panel-subtitle {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }

    .qr-wrapper {
      display: flex;
      justify-content: center;
      padding: var(--space-4);
      background: var(--bg-secondary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);

      .qr-img {
        border-radius: var(--radius-sm);
        display: block;
      }

      .qr-placeholder {
        width: 200px;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .qr-spinner {
        width: 32px;
        height: 32px;
        border: 2px solid var(--border-default);
        border-top-color: var(--text-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    }

    .qr-url {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      padding: var(--space-3) var(--space-4);
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-default);
    }

    .qr-url__label {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: var(--font-weight-semibold);
    }

    .qr-url__link {
      font-size: var(--font-size-xs);
      color: var(--text-primary);
      font-family: 'SF Mono', 'Fira Code', monospace;
      word-break: break-all;
      text-decoration: underline;
      text-underline-offset: 2px;
      cursor: pointer;
    }

    .btn-outline {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: 0 var(--space-4);
      height: 40px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      background: transparent;
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-base);
      width: 100%;

      &:hover { border-color: var(--border-strong); color: var(--text-primary); }
    }

    .session-stats {
      display: flex;
      gap: var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid var(--border-default);
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat__value {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      letter-spacing: -0.03em;
      color: var(--text-primary);
    }

    .stat__label {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0 var(--space-4);
      height: 36px;
      background: var(--color-black);
      color: var(--color-white);
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover { background: var(--color-gray-800); }
    }

    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--space-3);

      @media (max-width: 480px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .photo-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      background: var(--bg-secondary);
      border: 1px solid var(--border-default);

      &:hover .photo-item__overlay {
        opacity: 1;
      }
    }

    .photo-item__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);

      .photo-item:hover & {
        transform: scale(1.04);
      }
    }

    .photo-item__overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding: var(--space-2);
      opacity: 0;
      transition: opacity var(--transition-base);
    }

    .photo-item__delete {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      background: rgba(255,255,255,0.9);
      color: #EF4444;
      cursor: pointer;
      border: none;
      transition: all var(--transition-fast);

      &:hover { background: white; }
    }

    .photos-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-16) 0;
      text-align: center;
      gap: var(--space-2);
      color: var(--text-muted);

      svg { margin-bottom: var(--space-2); }

      p {
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-medium);
        color: var(--text-secondary);
      }

      span { font-size: var(--font-size-sm); }
    }

    .lightbox {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.92);
      z-index: var(--z-modal);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
    }

    .lightbox__close {
      position: absolute;
      top: var(--space-6);
      right: var(--space-6);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-full);
      background: rgba(255,255,255,0.1);
      color: white;
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover { background: rgba(255,255,255,0.2); }
    }

    .lightbox__img {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
      border-radius: var(--radius-md);
    }

    .qr-download { cursor: pointer; }
  `],
})
export class SessionDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private photoService = inject(PhotoService);
  private socketService = inject(SocketService);
  private auth = inject(AuthService);
  i18n = inject(I18nService);

  session = signal<Session | null>(null);
  photos = signal<Photo[]>([]);
  loading = signal(true);
  showUpload = signal(false);
  activePhoto = signal<Photo | null>(null);
  copied = signal(false);
  qrDataUrl = signal<string>('');

  galleryUrl = computed(() => {
    const s = this.session();
    if (!s) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://alphafilms.studio';
    return `${origin}/s/${s.slug}`;
  });

  galleryUrlDisplay = computed(() => {
    const s = this.session();
    if (!s) return '';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'photos.domain.com';
    return `${hostname}/s/${s.slug}`;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadSession(id);
    this.connectSocket(id);
  }

  loadSession(id: string): void {
    this.loading.set(true);
    this.sessionService.getById(id).subscribe({
      next: (session) => {
        this.session.set(session);
        this.loading.set(false);
        this.loadPhotos(id);
        this.generateQR();
      },
      error: () => this.loading.set(false),
    });
  }

  private generateQR(): void {
    const url = this.galleryUrl();
    if (!url) return;
    QRCode.toDataURL(url, { width: 200, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then(dataUrl => this.qrDataUrl.set(dataUrl))
      .catch(() => {});
  }

  loadPhotos(sessionId: string): void {
    this.photoService.getBySession(sessionId).subscribe({
      next: (photos) => this.photos.set(photos),
    });
  }

  connectSocket(sessionId: string): void {
    this.socketService.connect(this.auth.token() ?? undefined);
    this.socketService.joinSession(sessionId);
    this.socketService.onPhotoAdded().subscribe((event) => {
      if (event.photo) {
        this.photos.update((p) => [...p, event.photo]);
      } else {
        this.loadPhotos(sessionId);
      }
    });
  }

  photoUrl(photo: Photo): string {
    return `${environment.apiUrl.replace('/api/v1', '')}/${photo.webPath}`;
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.galleryUrl()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  downloadQR(): void {
    const dataUrl = this.qrDataUrl();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `qr-${this.session()?.slug}.png`;
    link.href = dataUrl;
    link.click();
  }

  openPhoto(photo: Photo): void {
    this.activePhoto.set(photo);
  }

  deletePhoto(photoId: string, event: Event): void {
    event.stopPropagation();
    this.photoService.delete(photoId).subscribe({
      next: () => {
        this.photos.update((p) => p.filter((x) => x.id !== photoId));
      },
    });
  }

  onPhotosUploaded(photos: Photo[]): void {
    this.photos.update((p) => [...p, ...photos]);
    this.showUpload.set(false);
  }

  ngOnDestroy(): void {
    const id = this.session()?.id;
    if (id) this.socketService.leaveSession(id);
  }
}
