import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Booking, Flat, Message, User } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFlats() { return this.http.get<Flat[]>(`${this.api}/flats`); }
  getFlat(id: number) { return this.http.get<Flat>(`${this.api}/flats/${id}`); }
  getMyFlats() { return this.http.get<Flat[]>(`${this.api}/flats/my`); }

  createFlat(formData: FormData) { return this.http.post<Flat>(`${this.api}/flats`, formData); }
  updateFlat(id: number, formData: FormData) { return this.http.put<Flat>(`${this.api}/flats/${id}`, formData); }
  deleteFlat(id: number) { return this.http.delete(`${this.api}/flats/${id}`); }

  getBookings() { return this.http.get<Booking[]>(`${this.api}/bookings`); }
  createBooking(payload: { flatId: number; startDate: string; endDate: string; paymentReference: string }) {
    return this.http.post<Booking>(`${this.api}/bookings`, payload);
  }
  updateBooking(id: number, payload: { startDate: string; endDate: string; paymentReference: string }) {
    return this.http.put<Booking>(`${this.api}/bookings/${id}`, payload);
  }
  updateBookingStatus(id: number, status: string) {
    return this.http.patch<Booking>(`${this.api}/bookings/${id}/status`, { status });
  }
  deleteBooking(id: number) { return this.http.delete(`${this.api}/bookings/${id}`); }

  getMessages(filters?: { flatId?: number; bookingId?: number }) {
    let params = new HttpParams();
    if (filters?.flatId) { params = params.set('flatId', filters.flatId); }
    if (filters?.bookingId) { params = params.set('bookingId', filters.bookingId); }
    return this.http.get<Message[]>(`${this.api}/messages`, { params });
  }

  sendMessage(payload: { flatId?: number; bookingId?: number; recipientId: string; body: string }) {
    return this.http.post<Message>(`${this.api}/messages`, payload);
  }

  deleteMessage(id: number) { return this.http.delete(`${this.api}/messages/${id}`); }

  getTenantDashboard() { return this.http.get<{ listingsCount: number; bookingsCount: number; messagesCount: number }>(`${this.api}/dashboard/tenant`); }
  getOwnerDashboard() { return this.http.get<{ myFlatsCount: number; bookingRequestsCount: number; messagesCount: number }>(`${this.api}/dashboard/owner`); }
  getAdminDashboard() { return this.http.get<{ usersCount: number; flatsCount: number; bookingsCount: number; messagesCount: number }>(`${this.api}/dashboard/admin`); }

  getMe() { return this.http.get<User>(`${this.api}/users/me`); }
  updateMe(payload: { fullName: string; email: string }) { return this.http.put<User>(`${this.api}/users/me`, payload); }

  getUsers() { return this.http.get<User[]>(`${this.api}/users`); }
  updateUser(id: string, payload: { fullName: string; email: string; role: string }) { return this.http.put<User>(`${this.api}/users/${id}`, payload); }
  deleteUser(id: string) { return this.http.delete(`${this.api}/users/${id}`); }

  importSeedFlats(ownerId: string) { return this.http.post<{ inserted: number }>(`${this.api}/import/flats?ownerId=${ownerId}`, {}); }
}
