import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-resource-state',
  standalone: true,
  template: `
    @if (error) {
      <div class="ledger-state ledger-state-error" role="alert">
        <span>{{ error }}</span>
        <button type="button" class="ledger-text-button" [disabled]="loading" (click)="retry.emit()">{{ loading ? 'Retrying…' : 'Try again' }}</button>
      </div>
    } @else if (loading) {
      <div class="ledger-skeleton" role="status" aria-label="Loading information">
        <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
        <span class="ledger-sr-only">Loading information…</span>
      </div>
    } @else if (empty) {
      <div class="ledger-state"><p>{{ emptyMessage }}</p></div>
    }
  `,
})
export class ResourceStateComponent {
  @Input() loading = false;
  @Input() error = '';
  @Input() empty = false;
  @Input() emptyMessage = 'Nothing here yet.';
  @Output() retry = new EventEmitter<void>();
}
