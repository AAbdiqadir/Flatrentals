import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Booking, Flat } from '../../models/types';
import { DashboardResource } from '../../shared/dashboard/dashboard-data';
import { DashboardActions } from '../../shared/dashboard/dashboard-actions';
import { ActionDialogComponent } from '../../shared/dashboard/action-dialog.component';
import { ResourceStateComponent } from '../../shared/dashboard/resource-state.component';

@Component({
  selector: 'app-dashboard-owner',
  standalone: true,
  imports: [CommonModule, RouterLink, ActionDialogComponent, ResourceStateComponent],
  providers: [DashboardActions],
  templateUrl: './dashboard-owner.component.html',
})
export class DashboardOwnerComponent {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly actions = inject(DashboardActions);
  readonly summary = new DashboardResource(() => this.api.getOwnerDashboard(), this.destroyRef);
  readonly flats = new DashboardResource(() => this.api.getMyFlats(), this.destroyRef);
  readonly bookings = new DashboardResource(() => this.api.getBookings(), this.destroyRef);
  readonly pendingCount = computed(() => this.bookings.data()?.filter(booking => booking.status === 'Pending').length ?? 0);

  constructor() { this.reload(); }

  reload(): void { this.summary.load(); this.flats.load(); this.bookings.load(); }

  setStatus(booking: Booking, status: 'Approved' | 'Rejected'): void {
    const work = () => this.api.updateBookingStatus(booking.id, status);
    if (status === 'Rejected') {
      this.actions.ask({ key: 'booking-' + booking.id, title: 'Reject this request?', description: `Reject ${booking.tenantName}'s booking request for ${booking.flatAddress}?`, label: 'Reject request', work, done: () => this.reload(), success: 'Booking request rejected.' });
      return;
    }
    this.actions.run('booking-' + booking.id, work, () => this.reload(), 'Booking request approved.');
  }

  deleteFlat(flat: Flat): void {
    this.actions.ask({ key: 'flat-' + flat.id, title: 'Delete this flat?', description: `${flat.address} will be removed from your listings. This cannot be undone.`, label: 'Delete flat', work: () => this.api.deleteFlat(flat.id), done: () => this.reload(), success: 'Flat deleted.' });
  }
}
