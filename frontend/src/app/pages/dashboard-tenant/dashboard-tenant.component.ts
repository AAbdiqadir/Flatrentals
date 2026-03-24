import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Booking, User } from '../../models/types';

@Component({
  selector: 'app-dashboard-tenant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-tenant.component.html',
  styleUrl: './dashboard-tenant.component.css'
})
export class DashboardTenantComponent implements OnInit {
  summary?: { listingsCount: number; bookingsCount: number; messagesCount: number };
  bookings: Booking[] = [];
  me?: User;

  profileForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    this.api.getTenantDashboard().subscribe((res) => this.summary = res);
    this.api.getBookings().subscribe((res) => this.bookings = res);
    this.api.getMe().subscribe((res) => {
      this.me = res;
      this.profileForm.patchValue({ fullName: res.fullName, email: res.email });
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.api.updateMe(this.profileForm.getRawValue() as { fullName: string; email: string })
      .subscribe(() => this.reload());
  }

  cancelBooking(id: number) {
    this.api.deleteBooking(id).subscribe(() => this.reload());
  }
}
