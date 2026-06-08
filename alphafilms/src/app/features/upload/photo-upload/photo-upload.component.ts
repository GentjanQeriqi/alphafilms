import {
  Component, inject, signal, Input, Output, EventEmitter, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../../core/services/photo.service';
import { Photo, UploadProgress } from '../../../core/models/photo.model';
import { I18nService } from '../../../core/services/i18n.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 25;

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="upload-modal animate-scale-in" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="upload-modal__header">
          <div>
            <h2 class="upload-modal__title">{{ i18n.t().upload_title }}</h2>
            <p class="upload-modal__subtitle">{{ i18n.t().upload_subtitle }}</p>
          </div>
          <button class="close-btn" (click)="close.emit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Drop Zone -->
        @if (queue().length === 0) {
          <div
            class="drop-zone"
            [class.drop-zone--active]="isDragging()"
            (dragover)="onDragOver($event)"
            (dragleave)="isDragging.set(false)"
            (drop)="onDrop($event)"
            (click)="fileInput.click()"
          >
            <div class="drop-zone__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="16 16 12 12 8 16"/>
                <line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
            </div>
            <p class="drop-zone__title">{{ i18n.t().upload_drop }}</p>
            <p class="drop-zone__hint">{{ i18n.t().upload_or }} <span class="drop-zone__browse">{{ i18n.t().upload_browse }}</span></p>
          </div>
        }

        <!-- Queue -->
        @if (queue().length > 0) {
          <div class="upload-queue">
            @for (item of queue(); track item.filename) {
              <div class="queue-item" [class]="'queue-item--' + item.status">
                <div class="queue-item__info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span class="queue-item__name">{{ item.filename }}</span>
                </div>

                <div class="queue-item__right">
                  @if (item.status === 'uploading') {
                    <div class="queue-item__progress-wrap">
                      <div class="queue-item__progress-bar">
                        <div
                          class="queue-item__progress-fill"
                          [style.width.%]="item.progress"
                        ></div>
                      </div>
                      <span class="queue-item__pct">{{ item.progress }}%</span>
                    </div>
                  }

                  @if (item.status === 'done') {
                    <div class="queue-item__status queue-item__status--done">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  }

                  @if (item.status === 'error') {
                    <div class="queue-item__status queue-item__status--error" [title]="item.error">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    </div>
                  }

                  @if (item.status === 'pending') {
                    <span class="queue-item__status-text">{{ i18n.t().upload_pending }}</span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Add more + Upload -->
          <div class="upload-modal__footer">
            <button class="btn-ghost" (click)="fileInput.click()" [disabled]="isUploading()">
              {{ i18n.t().upload_add_more }}
            </button>
            <button
              class="btn-primary"
              (click)="startUpload()"
              [disabled]="isUploading() || allDone()"
            >
              @if (isUploading()) {
                <div class="btn-spinner"></div>
                {{ i18n.t().upload_uploading }}
              } @else if (allDone()) {
                {{ i18n.t().upload_done }}
              } @else {
                {{ i18n.p('upload_btn', {n: pendingCount()}) }}
              }
            </button>
          </div>
        }

        <!-- Hidden input -->
        <input
          #fileInput
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          class="hidden-input"
          (change)="onFileSelect($event)"
        />
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

    .upload-modal {
      background: var(--bg-primary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      padding: var(--space-8);
      width: 100%;
      max-width: 520px;
      box-shadow: var(--shadow-xl);
    }

    .upload-modal__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .upload-modal__title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      letter-spacing: -0.03em;
    }

    .upload-modal__subtitle {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      margin-top: var(--space-1);
    }

    .close-btn {
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

    .drop-zone {
      border: 2px dashed var(--border-strong);
      border-radius: var(--radius-lg);
      padding: var(--space-12) var(--space-8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      text-align: center;
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover, &--active {
        border-color: var(--color-black);
        background: var(--bg-secondary);
      }
    }

    .drop-zone__icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      color: var(--text-muted);
      margin-bottom: var(--space-2);
    }

    .drop-zone__title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      letter-spacing: -0.01em;
    }

    .drop-zone__hint {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
    }

    .drop-zone__browse {
      color: var(--text-primary);
      text-decoration: underline;
      text-underline-offset: 2px;
      font-weight: var(--font-weight-medium);
    }

    .upload-queue {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-height: 320px;
      overflow-y: auto;
      margin-bottom: var(--space-5);
    }

    .queue-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--bg-secondary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);

      &--done { border-color: #BBF7D0; background: #F0FDF4; }
      &--error { border-color: #FECACA; background: #FEF2F2; }
    }

    .queue-item__info {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      min-width: 0;
      color: var(--text-secondary);

      svg { flex-shrink: 0; }
    }

    .queue-item__name {
      font-size: var(--font-size-sm);
      color: var(--text-primary);
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .queue-item__right {
      flex-shrink: 0;
    }

    .queue-item__progress-wrap {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .queue-item__progress-bar {
      width: 80px;
      height: 4px;
      background: var(--color-gray-200);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .queue-item__progress-fill {
      height: 100%;
      background: var(--color-black);
      border-radius: var(--radius-full);
      transition: width 0.2s ease;
    }

    .queue-item__pct {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      width: 32px;
      text-align: right;
    }

    .queue-item__status {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-full);

      &--done {
        background: #16A34A;
        color: white;
      }

      &--error {
        background: #DC2626;
        color: white;
      }
    }

    .queue-item__status-text {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }

    .upload-modal__footer {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
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
      padding: 0 var(--space-4);
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

      &:hover:not(:disabled) { background: var(--bg-secondary); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .hidden-input { display: none; }
  `],
})
export class PhotoUploadComponent {
  private photoService = inject(PhotoService);
  i18n = inject(I18nService);

  @Input({ required: true }) sessionId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() uploaded = new EventEmitter<Photo[]>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  queue = signal<UploadProgress[]>([]);
  isDragging = signal(false);
  isUploading = signal(false);

  pendingCount = () =>
    this.queue().filter((i) => i.status === 'pending').length;

  allDone = () =>
    this.queue().length > 0 &&
    this.queue().every((i) => i.status === 'done' || i.status === 'error');

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files) this.addFiles(Array.from(files));
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(Array.from(input.files));
    input.value = '';
  }

  addFiles(files: File[]): void {
    const valid = files.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
      return true;
    });

    const items: UploadProgress[] = valid.map((f) => ({
      filename: f.name,
      progress: 0,
      status: 'pending',
      _file: f,
    } as any));

    this.queue.update((q) => [...q, ...items]);
  }

  startUpload(): void {
    if (this.isUploading()) return;
    this.isUploading.set(true);

    const pending = (this.queue() as any[]).filter((i) => i.status === 'pending');
    const uploadedPhotos: Photo[] = [];
    let remaining = pending.length;

    if (!remaining) {
      this.isUploading.set(false);
      return;
    }

    pending.forEach((item) => {
      this.updateItem(item.filename, { status: 'uploading', progress: 0 });

      this.photoService.uploadPhoto(this.sessionId, item._file).subscribe({
        next: ({ progress, photo }) => {
          this.updateItem(item.filename, { progress });
          if (photo) {
            this.updateItem(item.filename, { status: 'done', progress: 100 });
            uploadedPhotos.push(photo);
            remaining--;
            if (remaining === 0) {
              this.isUploading.set(false);
              this.uploaded.emit(uploadedPhotos);
            }
          }
        },
        error: (err) => {
          this.updateItem(item.filename, {
            status: 'error',
            error: err?.error?.message ?? 'Upload failed',
          });
          remaining--;
          if (remaining === 0) {
            this.isUploading.set(false);
          }
        },
      });
    });
  }

  private updateItem(
    filename: string,
    patch: Partial<UploadProgress>
  ): void {
    this.queue.update((q) =>
      q.map((i) => (i.filename === filename ? { ...i, ...patch } : i))
    );
  }
}
