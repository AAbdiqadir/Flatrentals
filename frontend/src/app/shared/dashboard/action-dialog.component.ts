import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { DashboardConfirmation } from './dashboard-actions';

@Component({
  selector: 'app-action-dialog',
  standalone: true,
  template: `
    <dialog #dialog class="ledger-dialog" aria-labelledby="action-dialog-title" aria-describedby="action-dialog-description" (cancel)="cancel($event)">
      @if (request) {
        <h2 id="action-dialog-title">{{ request.title }}</h2>
        <p id="action-dialog-description">{{ request.description }}</p>
        @if (error) { <p class="ledger-field-error" role="alert">{{ error }}</p> }
        <div class="ledger-dialog-actions">
          <button type="button" class="ledger-button" autofocus [disabled]="busy" (click)="dismissed.emit()">Keep it</button>
          <button type="button" class="ledger-button ledger-button-danger" [disabled]="busy" (click)="confirmed.emit()">{{ busy ? 'Working…' : request.label }}</button>
        </div>
      }
    </dialog>
  `,
})
export class ActionDialogComponent implements AfterViewInit, OnChanges {
  @Input() request: DashboardConfirmation | null = null;
  @Input() busy = false;
  @Input() error = '';
  @Output() confirmed = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();
  @ViewChild('dialog') private dialog?: ElementRef<HTMLDialogElement>;

  ngAfterViewInit(): void { this.sync(); }
  ngOnChanges(): void { this.sync(); }

  cancel(event: Event): void {
    event.preventDefault();
    if (!this.busy) this.dismissed.emit();
  }

  private sync(): void {
    const dialog = this.dialog?.nativeElement;
    if (!dialog) return;
    if (this.request && !dialog.open) dialog.showModal();
    if (!this.request && dialog.open) dialog.close();
  }
}
