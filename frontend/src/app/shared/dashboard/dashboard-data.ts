import { DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';

export function accountInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length ? (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase() : '—';
}

export function requestError(error: unknown, fallback: string): string {
  const body = (error as { error?: unknown })?.error;
  if (Array.isArray(body) && body.every(value => typeof value === 'string')) return body.join(' ');
  if (body && typeof body === 'object') {
    const response = body as { errors?: Record<string, string[]>; message?: string };
    if (response.errors) return Object.values(response.errors).flat().join(' ');
    if (typeof response.message === 'string') return response.message;
  }
  return fallback;
}

/** Keeps existing rows visible during refresh; each block can fail and retry independently. */
export class DashboardResource<T> {
  readonly data = signal<T | undefined>(undefined);
  readonly loading = signal(false);
  readonly error = signal('');

  constructor(private source: () => Observable<T>, private destroyRef: DestroyRef) {}

  load(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.source().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: value => this.data.set(value),
      error: error => this.error.set(requestError(error, 'Could not load this information. Please try again.')),
    });
  }
}
