import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Booking, Flat, User } from '../../models/types';
import { DashboardResource, accountInitials } from '../../shared/dashboard/dashboard-data';
import { DashboardActions } from '../../shared/dashboard/dashboard-actions';
import { ActionDialogComponent } from '../../shared/dashboard/action-dialog.component';
import { ResourceStateComponent } from '../../shared/dashboard/resource-state.component';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ActionDialogComponent, ResourceStateComponent],
  providers: [DashboardActions],
  templateUrl: './dashboard-admin.component.html',
})
export class DashboardAdminComponent {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly auth = inject(AuthService);
  readonly actions = inject(DashboardActions);
  readonly initials = accountInitials;
  readonly summary = new DashboardResource(() => this.api.getAdminDashboard(), this.destroyRef);
  readonly users = new DashboardResource(() => this.api.getUsers(), this.destroyRef);
  readonly flats = new DashboardResource(() => this.api.getFlats(), this.destroyRef);
  readonly bookings = new DashboardResource(() => this.api.getBookings(), this.destroyRef);
  editUserId = '';
  readonly userForm = inject(FormBuilder).nonNullable.group({
    fullName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    role: ['Tenant', Validators.required],
  });

  constructor() { this.reload(); }

  reload(): void { this.summary.load(); this.users.load(); this.flats.load(); this.bookings.load(); }

  startEdit(user: User): void {
    this.editUserId = user.id;
    this.userForm.reset({ fullName: user.fullName, email: user.email, role: user.role });
    this.actions.error.set('');
    this.actions.notice.set('');
    requestAnimationFrame(() => document.getElementById('admin-user-name')?.focus());
  }

  saveUser(): void {
    if (!this.editUserId || this.actions.busy()) return;
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid) return;
    const id = this.editUserId;
    const values = this.userForm.getRawValue();
    const payload = { ...values, fullName: values.fullName.trim(), email: values.email.trim() };
    this.actions.run('save-user', () => this.api.updateUser(id, payload), () => { this.editUserId = ''; this.reload(); }, 'User details updated.');
  }

  deleteUser(user: User): void {
    this.actions.ask({ key: 'user-' + user.id, title: 'Delete this user?', description: `${user.fullName} will be removed from FlatRental. This cannot be undone.`, label: 'Delete user', work: () => this.api.deleteUser(user.id), done: () => { if (this.editUserId === user.id) this.editUserId = ''; this.reload(); }, success: 'User deleted.' });
  }

  deleteFlat(flat: Flat): void {
    this.actions.ask({ key: 'flat-' + flat.id, title: 'Delete this flat?', description: `${flat.address} will be removed from the listings. This cannot be undone.`, label: 'Delete flat', work: () => this.api.deleteFlat(flat.id), done: () => this.reload(), success: 'Flat deleted.' });
  }

  deleteBooking(booking: Booking): void {
    this.actions.ask({ key: 'booking-' + booking.id, title: 'Delete this booking?', description: `The booking for ${booking.flatAddress} by ${booking.tenantName} will be removed. This cannot be undone.`, label: 'Delete booking', work: () => this.api.deleteBooking(booking.id), done: () => this.reload(), success: 'Booking deleted.' });
  }
}
