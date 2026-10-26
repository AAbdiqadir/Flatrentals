import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Booking } from '../../models/types';
import { DashboardResource } from '../../shared/dashboard/dashboard-data';
import { DashboardActions } from '../../shared/dashboard/dashboard-actions';
import { ActionDialogComponent } from '../../shared/dashboard/action-dialog.component';
import { ResourceStateComponent } from '../../shared/dashboard/resource-state.component';

@Component({
  selector: 'app-dashboard-tenant',
  standalone: true,
  imports: [CommonModule, RouterLink, ActionDialogComponent, ResourceStateComponent],
  providers: [DashboardActions],
  templateUrl: './dashboard-tenant.component.html',
})
export class DashboardTenantComponent {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly actions = inject(DashboardActions);
  readonly summary = new DashboardResource(() => this.api.getTenantDashboard(), this.destroyRef);
  readonly bookings = new DashboardResource(() => this.api.getBookings(), this.destroyRef);
  readonly pendingCount = computed(() => this.bookings.data()?.filter(booking => booking.status === 'Pending').length ?? 0);

  constructor() { this.reload(); }

  reload(): void { this.summary.load(); this.bookings.load(); }

  cancelBooking(booking: Booking): void {
    this.actions.ask({
      key: 'cancel-' + booking.id,
      title: 'Cancel this booking?',
      description: `Your request for ${booking.flatAddress} will be cancelled. This cannot be undone.`,
      label: 'Cancel booking',
      work: () => this.api.deleteBooking(booking.id),
      done: () => this.reload(),
      success: 'Booking cancelled.',
    });
  }
}
