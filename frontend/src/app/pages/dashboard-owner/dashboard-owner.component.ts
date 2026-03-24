import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Booking, Flat } from '../../models/types';

@Component({
  selector: 'app-dashboard-owner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-owner.component.html',
  styleUrl: './dashboard-owner.component.css'
})
export class DashboardOwnerComponent implements OnInit {
  summary?: { myFlatsCount: number; bookingRequestsCount: number; messagesCount: number };
  flats: Flat[] = [];
  bookings: Booking[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    this.api.getOwnerDashboard().subscribe((res) => this.summary = res);
    this.api.getMyFlats().subscribe((res) => this.flats = res);
    this.api.getBookings().subscribe((res) => this.bookings = res);
  }

  setStatus(id: number, status: string) {
    this.api.updateBookingStatus(id, status).subscribe(() => this.reload());
  }

  deleteFlat(id: number) {
    this.api.deleteFlat(id).subscribe(() => this.reload());
  }
}
