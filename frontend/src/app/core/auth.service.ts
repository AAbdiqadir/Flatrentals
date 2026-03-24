import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../models/types';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'flat_rental_auth';
  private readonly authState = signal<AuthResponse | null>(this.readStoredAuth());

  readonly user = computed(() => this.authState());
  readonly isLoggedIn = computed(() => !!this.authState()?.token);
  readonly role = computed(() => this.authState()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.setAuth(res)));
  }

  register(fullName: string, email: string, password: string, role: 'Owner' | 'Tenant') {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { fullName, email, password, role })
      .pipe(tap((res) => this.setAuth(res)));
  }

  loginWithFace(email: string, imageBase64: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/faceauth/login`, { email, imageBase64 })
      .pipe(tap((res) => this.setAuth(res)));
  }

  enrollFace(imageBase64: string) {
    return this.http.post<{ message: string; subject: string }>(`${environment.apiUrl}/faceauth/enroll`, { imageBase64 });
  }

  logout() {
    localStorage.removeItem(this.storageKey);
    this.authState.set(null);
    this.router.navigateByUrl('/login');
  }

  getToken() {
    return this.authState()?.token ?? null;
  }

  private setAuth(auth: AuthResponse) {
    this.authState.set(auth);
    localStorage.setItem(this.storageKey, JSON.stringify(auth));
  }

  private readStoredAuth(): AuthResponse | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      return null;
    }
  }
}
