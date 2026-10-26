import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, defer, finalize } from 'rxjs';
import { requestError } from './dashboard-data';

export interface DashboardConfirmation {
  key: string;
  title: string;
  description: string;
  label: string;
  work: () => Observable<unknown>;
  done: () => void;
  success: string;
}

@Injectable()
export class DashboardActions {
  private readonly destroyRef = inject(DestroyRef);
  readonly request = signal<DashboardConfirmation | null>(null);
  readonly busy = signal<string | null>(null);
  readonly error = signal('');
  readonly notice = signal('');

  ask(request: DashboardConfirmation): void {
    if (this.busy()) return;
    this.error.set('');
    this.notice.set('');
    this.request.set(request);
  }

  dismiss(): void {
    if (this.busy()) return;
    this.request.set(null);
    this.error.set('');
  }

  confirm(): void {
    const request = this.request();
    if (request) this.run(request.key, request.work, request.done, request.success);
  }

  run(key: string, work: () => Observable<unknown>, done: () => void, success: string): void {
    if (this.busy()) return;
    this.busy.set(key);
    this.error.set('');
    this.notice.set('');
    defer(work).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.busy.set(null)),
    ).subscribe({
      next: () => {
        this.request.set(null);
        this.notice.set(success);
        done();
      },
      error: error => this.error.set(requestError(error, 'Could not complete this action. Please try again.')),
    });
  }
}
