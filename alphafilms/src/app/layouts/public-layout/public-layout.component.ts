import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="public-layout">
      <router-outlet />
      <footer class="public-footer">
        <span>Powered by</span>
        <strong>AlphaFilms</strong>
      </footer>
    </div>
  `,
  styles: [`
    .public-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
    }

    .public-footer {
      margin-top: auto;
      padding: var(--space-6);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      letter-spacing: 0.01em;

      strong {
        font-weight: var(--font-weight-semibold);
        color: var(--text-secondary);
      }
    }
  `],
})
export class PublicLayoutComponent {}
