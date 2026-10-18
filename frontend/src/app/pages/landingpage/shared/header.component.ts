import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon.component';
import { BrandComponent } from './brand.component';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, IconComponent, BrandComponent],
  template: `<header class="header">
    <div class="container nav-shell">
      <a routerLink="/" class="wordmark" aria-label="Vision Glide home"
        ><app-brand
      /></a>
      <nav aria-label="Main navigation" class="desktop-nav">
        @for (link of links; track link.id) {
          <a routerLink="/" [fragment]="link.id">{{ link.label }}</a>
        }
      </nav>
      <div class="nav-actions">
        <a routerLink="/login" class="login-link">Log in</a
        ><a routerLink="/get-started" class="button button-dark nav-cta"
          >Get started <app-icon name="arrow" /></a
        ><button
          #menuToggle
          type="button"
          class="menu-toggle"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="mobile-navigation"
          [attr.aria-label]="
            menuOpen() ? 'Close navigation' : 'Open navigation'
          "
          (click)="menuOpen.set(!menuOpen())"
        >
          <app-icon [name]="menuOpen() ? 'close' : 'menu'" />
        </button>
      </div>
    </div>
    <nav
      id="mobile-navigation"
      class="mobile-nav container"
      aria-label="Mobile navigation"
      [hidden]="!menuOpen()"
    >
      @for (link of links; track link.id) {
        <a routerLink="/" [fragment]="link.id" (click)="menuOpen.set(false)">{{
          link.label
        }}</a>
      }
      <a routerLink="/login" (click)="menuOpen.set(false)">Log in</a>
    </nav>
  </header>`,
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @ViewChild('menuToggle') private menuToggle?: ElementRef<HTMLButtonElement>;
  readonly menuOpen = signal(false);
  readonly links = [
    { id: 'product', label: 'Product' },
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How it works' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' },
  ];
  @HostListener('document:keydown.escape') closeMenu() {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.menuToggle?.nativeElement.focus();
  }
}
