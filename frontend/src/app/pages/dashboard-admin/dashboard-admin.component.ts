import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Booking, Flat, User } from '../../models/types';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent implements OnInit {
  summary?: { usersCount: number; flatsCount: number; bookingsCount: number; messagesCount: number };
  users: User[] = [];
  flats: Flat[] = [];
  bookings: Booking[] = [];

  editUserId = '';
  userForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['Tenant', Validators.required]
  });

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    this.api.getAdminDashboard().subscribe((res) => this.summary = res);
    this.api.getUsers().subscribe((res) => this.users = res);
    this.api.getFlats().subscribe((res) => this.flats = res);
    this.api.getBookings().subscribe((res) => this.bookings = res);
  }

  startEdit(user: User) {
    this.editUserId = user.id;
    this.userForm.patchValue({ fullName: user.fullName, email: user.email, role: user.role });
  }

  saveUser() {
    if (!this.editUserId || this.userForm.invalid) {
      return;
    }

    this.api.updateUser(this.editUserId, this.userForm.getRawValue() as { fullName: string; email: string; role: string })
      .subscribe(() => {
        this.editUserId = '';
        this.reload();
      });
  }

  deleteUser(id: string) { this.api.deleteUser(id).subscribe(() => this.reload()); }
  deleteFlat(id: number) { this.api.deleteFlat(id).subscribe(() => this.reload()); }
  deleteBooking(id: number) { this.api.deleteBooking(id).subscribe(() => this.reload()); }
}
