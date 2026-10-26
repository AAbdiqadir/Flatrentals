import { Component, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { accountInitials } from './dashboard-data';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard-shell.component.html',
})
export class DashboardShellComponent {
  readonly auth = inject(AuthService);
  readonly menuOpen = signal(false);
  readonly base = '/' + inject(ActivatedRoute).snapshot.routeConfig?.path;
  readonly initials = accountInitials;
  @ViewChild('menuButton') private menuButton?: ElementRef<HTMLButtonElement>;

  constructor() {
    inject(Router).events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => this.menuOpen.set(false));
  }

  @HostListener('document:keydown.escape') closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.menuButton?.nativeElement.focus();
  }
}
