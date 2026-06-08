import {
  Component, inject, signal, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { PhotoService } from '../../../core/services/photo.service';
import { SocketService } from '../../../core/services/socket.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Session } from '../../../core/models/session.model';
import { Photo } from '../../../core/models/photo.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Instagram Gate -->
    @if (showGate()) {
      <div class="ig-gate">
        <div class="ig-gate__card animate-scale-in">

          <!-- Logo -->
          <img
            src="/icons/653808452_18389039152157499_337970551999006012_n.jpg"
            alt="AlphaFilms"
            class="ig-gate__logo"
          />

          <h2 class="ig-gate__title">{{ i18n.t().gate_title }}</h2>
          <p class="ig-gate__desc">{{ i18n.t().gate_desc }}</p>

          <!-- Instagram handle -->
          <a
            [href]="instagramUrl"
            target="_blank"
            rel="noopener"
            class="ig-gate__ig-btn"
            (click)="onInstagramClick()"
          >
            <!-- Instagram SVG icon -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
            {{ i18n.p('gate_follow_btn', {handle: instagramHandle}) }}
          </a>

          <!-- Confirm step — appears after clicking Instagram -->
          @if (clickedInstagram()) {
            <button class="ig-gate__confirm" (click)="confirmFollow()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ i18n.t().gate_confirm_btn }}
            </button>
          } @else {
            <p class="ig-gate__hint">{{ i18n.t().gate_hint }}</p>
          }

        </div>

        <!-- Background grid -->
        <div class="ig-gate__bg" aria-hidden="true">
          <div class="ig-gate__grid"></div>
        </div>
      </div>
    }

    <div class="gallery" [class.gallery--hidden]="showGate()">

      @if (loading()) {
        <div class="gallery__loading">
          <div class="gallery__spinner"></div>
          <p>{{ i18n.t().gallery_loading }}</p>
        </div>
      }

      @if (!loading() && error()) {
        <div class="gallery__error">
          <div class="gallery__error-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2>{{ i18n.t().gallery_not_found }}</h2>
          <p>{{ i18n.t().gallery_not_found_desc }}</p>
        </div>
      }

      @if (!loading() && session()) {
        <!-- Hero Header -->
        <div class="gallery__hero">
          <div class="gallery__hero-content">
            <div class="gallery__brand">
              <img
                src="/icons/653808452_18389039152157499_337970551999006012_n.jpg"
                alt="AlphaFilms"
                class="gallery__brand-logo"
              />
              <span class="gallery__brand-name">AlphaFilms</span>
              <button class="gallery__lang-toggle" (click)="i18n.toggle()" [title]="i18n.lang() === 'sq' ? 'Switch to English' : 'Kalo në Shqip'">
                {{ i18n.lang() === 'sq' ? 'EN' : 'SQ' }}
              </button>
            </div>

            <h1 class="gallery__title">{{ session()!.name }}</h1>
            <p class="gallery__meta">
              {{ photos().length === 1 ? i18n.t().card_photos_one : i18n.p('card_photos_many', {n: photos().length}) }}
              &bull;
              {{ session()!.createdAt | date:'MMMM d, y' }}
            </p>

            @if (isLive()) {
              <div class="gallery__live-badge">
                <span class="gallery__live-dot"></span>
                {{ i18n.t().gallery_live }}
              </div>
            }
          </div>
        </div>

        <!-- Photo Grid -->
        @if (photos().length > 0) {
          <div class="gallery__grid-wrapper">
            <div class="gallery__grid">
              @for (photo of photos(); track photo.id; let i = $index) {
                <div
                  class="gallery__item"
                  [class.gallery__item--wide]="i % 5 === 0"
                  (click)="openPhoto(photo)"
                  style="animation-delay: {{ Math.min(i * 40, 400) }}ms"
                >
                  <img
                    [src]="photoUrl(photo)"
                    [alt]="'Photo ' + (i + 1)"
                    loading="lazy"
                    class="gallery__item-img"
                  />
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="gallery__empty">
            <div class="gallery__empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <h3>{{ i18n.t().gallery_empty }}</h3>
            <p>{{ i18n.t().gallery_empty_desc }}</p>
          </div>
        }
      }
    </div>

    <!-- Lightbox -->
    @if (activePhoto()) {
      <div class="lightbox" (click)="activePhoto.set(null)">
        <button class="lightbox__close" (click)="activePhoto.set(null)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <button class="lightbox__nav lightbox__nav--prev" (click)="prevPhoto($event)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <img
          [src]="photoUrl(activePhoto()!)"
          [alt]="activePhoto()!.filename"
          class="lightbox__img animate-scale-in"
          (click)="$event.stopPropagation()"
        />

        <button class="lightbox__nav lightbox__nav--next" (click)="nextPhoto($event)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <div class="lightbox__counter">
          {{ activePhotoIndex + 1 }} / {{ photos().length }}
        </div>
      </div>
    }
  `,
  styles: [`
    /* ── Instagram Gate ── */
    .ig-gate {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
      background: var(--bg-primary);
      overflow: hidden;
    }

    .ig-gate__bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .ig-gate__grid {
      width: 100%;
      height: 100%;
      background-image:
        linear-gradient(var(--color-gray-100) 1px, transparent 1px),
        linear-gradient(90deg, var(--color-gray-100) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.6;
    }

    .ig-gate__card {
      position: relative;
      z-index: 1;
      background: var(--bg-primary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      padding: var(--space-12) var(--space-10);
      width: 100%;
      max-width: 420px;
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--space-4);

      @media (max-width: 480px) {
        padding: var(--space-8) var(--space-6);
      }
    }

    .ig-gate__logo {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-md);
      object-fit: cover;
      border: 1px solid var(--border-default);
      margin-bottom: var(--space-2);
    }

    .ig-gate__title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
      letter-spacing: -0.04em;
      color: var(--text-primary);
    }

    .ig-gate__desc {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: var(--line-height-base);
      max-width: 320px;
    }

    .ig-gate__ig-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      width: 100%;
      height: 52px;
      background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      text-decoration: none;
      cursor: pointer;
      transition: all var(--transition-base);
      letter-spacing: 0.01em;
      margin-top: var(--space-2);

      &:hover {
        opacity: 0.92;
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
    }

    .ig-gate__confirm {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
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

      &:hover { background: var(--color-gray-800); }
    }

    .ig-gate__hint {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      line-height: var(--line-height-base);
    }

    .gallery--hidden {
      display: none;
    }

    /* ── Gallery ── */
    .gallery {
      min-height: 100vh;
      background: var(--bg-primary);
    }

    .gallery__loading {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }

    .gallery__spinner {
      width: 36px;
      height: 36px;
      border: 2px solid var(--color-gray-200);
      border-top-color: var(--color-black);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .gallery__error {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      text-align: center;
      padding: var(--space-8);
      color: var(--text-muted);

      h2 {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }

      p { font-size: var(--font-size-sm); }
    }

    .gallery__error-icon {
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      margin-bottom: var(--space-2);
    }

    /* Hero */
    .gallery__hero {
      padding: var(--space-16) var(--space-6) var(--space-10);
      border-bottom: 1px solid var(--border-default);
      background: var(--bg-primary);
    }

    .gallery__hero-content {
      max-width: 680px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
    }

    .gallery__lang-toggle {
      margin-left: auto;
      padding: 4px 10px;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.8);
      font-family: var(--font-family);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all var(--transition-base);
      &:hover { background: rgba(255,255,255,0.2); color: #fff; }
    }

    .gallery__brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }

    .gallery__brand-logo {
      width: 24px;
      height: 24px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }

    .gallery__brand-name {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--text-muted);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .gallery__title {
      font-size: clamp(var(--font-size-3xl), 5vw, var(--font-size-5xl));
      font-weight: var(--font-weight-extrabold);
      letter-spacing: -0.04em;
      color: var(--text-primary);
      line-height: 1;
    }

    .gallery__meta {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
    }

    .gallery__live-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-1) var(--space-3);
      background: var(--color-gray-100);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
    }

    .gallery__live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22C55E;
      box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 2px rgba(34,197,94,0.2); }
      50% { box-shadow: 0 0 0 5px rgba(34,197,94,0.1); }
    }

    /* Grid */
    .gallery__grid-wrapper {
      padding: var(--space-8) var(--space-6);
      max-width: 1400px;
      margin: 0 auto;
    }

    .gallery__grid {
      columns: 4 280px;
      gap: var(--space-3);
    }

    .gallery__item {
      break-inside: avoid;
      margin-bottom: var(--space-3);
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      background: var(--bg-secondary);
      animation: fadeIn 400ms ease both;

      &:hover .gallery__item-img {
        transform: scale(1.03);
      }
    }

    .gallery__item-img {
      width: 100%;
      display: block;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }

    .gallery__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-20) var(--space-8);
      text-align: center;
      gap: var(--space-3);
      color: var(--text-muted);

      h3 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }

      p { font-size: var(--font-size-sm); }
    }

    .gallery__empty-icon {
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
    }

    /* Lightbox */
    .lightbox {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.96);
      z-index: var(--z-modal);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8) 60px;
    }

    .lightbox__close {
      position: absolute;
      top: var(--space-5);
      right: var(--space-5);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-full);
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.8);
      cursor: pointer;
      transition: all var(--transition-base);
      z-index: 1;

      &:hover { background: rgba(255,255,255,0.15); color: white; }
    }

    .lightbox__nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-full);
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.8);
      cursor: pointer;
      transition: all var(--transition-base);
      z-index: 1;

      &:hover { background: rgba(255,255,255,0.15); color: white; }

      &--prev { left: var(--space-4); }
      &--next { right: var(--space-4); }
    }

    .lightbox__img {
      max-width: calc(100vw - 160px);
      max-height: 90vh;
      object-fit: contain;
      border-radius: var(--radius-sm);
    }

    .lightbox__counter {
      position: absolute;
      bottom: var(--space-5);
      left: 50%;
      transform: translateX(-50%);
      font-size: var(--font-size-xs);
      color: rgba(255,255,255,0.5);
      font-weight: var(--font-weight-medium);
      letter-spacing: 0.05em;
    }
  `],
})
export class GalleryComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private photoService = inject(PhotoService);
  private socketService = inject(SocketService);
  i18n = inject(I18nService);

  session = signal<Session | null>(null);
  photos = signal<Photo[]>([]);
  loading = signal(true);
  error = signal(false);
  activePhoto = signal<Photo | null>(null);
  isLive = signal(false);
  showGate = signal(false);
  clickedInstagram = signal(false);

  readonly instagramHandle = environment.instagramHandle;
  readonly instagramUrl = `https://www.instagram.com/${environment.instagramHandle}`;

  Math = Math;

  get activePhotoIndex(): number {
    const active = this.activePhoto();
    if (!active) return -1;
    return this.photos().findIndex((p) => p.id === active.id);
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    const gateKey = `af_gate_${slug}`;
    const passed = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(gateKey) === '1';
    this.showGate.set(!passed);
    this._gateKey = gateKey;
    this.loadGallery(slug);
  }

  private _gateKey = '';

  onInstagramClick(): void {
    this.clickedInstagram.set(true);
  }

  confirmFollow(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this._gateKey, '1');
    }
    this.showGate.set(false);
  }

  loadGallery(slug: string): void {
    this.loading.set(true);
    this.sessionService.getPublicBySlug(slug).subscribe({
      next: (session) => {
        this.session.set(session);
        this.loading.set(false);
        this.loadPhotos(slug);
        this.connectLive(session.id);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  loadPhotos(slug: string): void {
    this.photoService.getPublicBySlug(slug).subscribe({
      next: (photos) => this.photos.set(photos),
    });
  }

  connectLive(sessionId: string): void {
    this.socketService.connect();
    this.socketService.joinSession(sessionId);
    this.isLive.set(true);

    this.socketService.onPhotoAdded().subscribe((event) => {
      if (event.photo) {
        this.photos.update((p) => [...p, event.photo]);
      }
    });
  }

  photoUrl(photo: Photo): string {
    return `${environment.apiUrl.replace('/api/v1', '')}/${photo.webPath}`;
  }

  openPhoto(photo: Photo): void {
    this.activePhoto.set(photo);
  }

  prevPhoto(event: Event): void {
    event.stopPropagation();
    const idx = this.activePhotoIndex;
    if (idx > 0) this.activePhoto.set(this.photos()[idx - 1]);
  }

  nextPhoto(event: Event): void {
    event.stopPropagation();
    const idx = this.activePhotoIndex;
    if (idx < this.photos().length - 1) this.activePhoto.set(this.photos()[idx + 1]);
  }

  ngOnDestroy(): void {
    const id = this.session()?.id;
    if (id) this.socketService.leaveSession(id);
  }
}
