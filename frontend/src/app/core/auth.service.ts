import { Injectable, computed, signal } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import {
Observable,
catchError,
defer,
finalize,
firstValueFrom,
from,
map,
of,
shareReplay,
tap,
throwError,
timeout
} from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../models/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authState = signal<AuthResponse | null>(null);
  private refreshRequest?: Observable<AuthResponse>;
  private initializationPromise?: Promise<void>;

  readonly user = computed(() => this.authState());
  readonly isLoggedIn = computed(() => !!this.authState()?.token);
  readonly role = computed(() => this.authState()?.role ?? null);

  readonly isSigningOut = signal(false);
  readonly sessionError = signal('');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Remove credentials saved by the previous implementation.
    try {
      localStorage.removeItem('flat_rental_auth');
    } catch {
      // Storage can be unavailable.
    }
  }

  initialize(): Promise<void> {
    // Startup and route guards share one restoration attempt, even after it ends.
    return this.initializationPromise ??= this.restoreSession();
  }

  private async restoreSession(): Promise<void> {
    try {
      await firstValueFrom(this.refreshSession());
    } catch {
      // A missing session or unavailable API leaves the visitor signed out.
    }
  }

  login(email: string, password: string, rememberMe = false) {
    return this.authenticate('/auth/login', {
      email,
      password,
      rememberMe
    });
  }

  register(
    fullName: string,
    email: string,
    password: string,
    role: 'Owner' | 'Tenant',
    rememberMe = false
  ) {
    return this.authenticate('/auth/register', {
      fullName,
      email,
      password,
      role,
      rememberMe
    });
  }

  loginWithFace(
    email: string,
    imageBase64: string,
    rememberMe = false
  ) {
    return this.authenticate('/faceauth/login', {
      email,
      imageBase64,
      rememberMe
    });
  }

  enrollFace(imageBase64: string) {
    return this.http.post<{ message: string; subject: string }>(
      `${environment.apiUrl}/faceauth/enroll`,
      { imageBase64 }
    );
  }

  refreshSession(): Observable<AuthResponse> {
    if (this.isSigningOut()) {
      return throwError(() => new Error('Signing out.'));
    }

    if (!this.refreshRequest) {
      this.refreshRequest = defer(() =>
        from(this.withSessionLock(() =>
          firstValueFrom(
            this.http.post<AuthResponse>(
              `${environment.apiUrl}/auth/refresh`,
              {}
            ).pipe(timeout(10000))
          )
        ))
      ).pipe(
        tap(auth => this.authState.set(auth)),
        catchError((error: unknown) => {
          if (
            error instanceof HttpErrorResponse &&
            error.status === 401
          ) {
            this.endLocalSession();
          }

          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }

    return this.refreshRequest;
  }

  getValidToken(): Observable<string | null> {
    if (this.isSigningOut()) return of(null);

    const auth = this.authState();

    if (!auth) return of(null);

    const validForThirtySeconds =
      Date.parse(auth.expiresAt) > Date.now() + 30000;

    if (validForThirtySeconds) {
      return of(auth.token);
    }

    return this.refreshSession().pipe(
      map(response => response.token)
    );
  }

  getToken(): string | null {
    return this.authState()?.token ?? null;
  }

  logout(): void {
    if (this.isSigningOut()) return;

    this.isSigningOut.set(true);
    this.sessionError.set('');

    from(this.withSessionLock(() =>
      firstValueFrom(
        this.http.post<void>(
          `${environment.apiUrl}/auth/logout`,
          {}
        ).pipe(timeout(10000))
      )
    )).pipe(
      finalize(() => this.isSigningOut.set(false))
    ).subscribe({
      next: () => this.endLocalSession(),
      error: () => this.sessionError.set(
        'Could not sign out. Check your connection and try again.'
      )
    });
  }

  private authenticate(path: string, body: object) {
    return defer(() =>
      from(this.withSessionLock(() =>
        firstValueFrom(
          this.http.post<AuthResponse>(
            `${environment.apiUrl}${path}`,
            body
          ).pipe(timeout(15000))
        )
      ))
    ).pipe(
      tap(auth => {
        this.authState.set(auth);
        this.sessionError.set('');
      })
    );
  }

  private endLocalSession(): void {
    const hadSession = this.isLoggedIn();
    this.authState.set(null);

    if (hadSession) {
      void this.router.navigateByUrl('/login');
    }
  }

  private async withSessionLock<T>(
    work: () => Promise<T>
  ): Promise<T> {
    if (
      typeof navigator !== 'undefined' &&
      navigator.locks
    ) {
        return navigator.locks.request(
        'flat-rental-session',
        work);
    }

    return work();
  }
}
