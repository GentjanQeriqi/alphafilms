import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="layout">
      <app-navbar />
      <main class="layout__main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
    }

    .layout__main {
      flex: 1;
    }
  `],
})
export class MainLayoutComponent {}
