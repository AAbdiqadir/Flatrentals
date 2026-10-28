import { Component, computed, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, ROUTES, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from '../app.config';
import { AuthResponse } from '../models/types';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { guestGuard } from './guest.guard';
import { roleGuard } from './role.guard';

@Component({ selector: 'test-session-public', standalone: true, template: 'Public page' })
class PublicPage {}

@Component({ selector: 'test-session-protected', standalone: true, template: 'Protected page' })
class ProtectedPage {}

@Component({ selector: 'test-session-login', standalone: true, template: 'Login page' })
class LoginPage {}

describe('Routing during session restoration', () => {
  let finishRestoration: () => void;
  let guardStarted: Promise<void>;
  let restoredRole: WritableSignal<AuthResponse['role'] | null>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    restoredRole = signal<AuthResponse['role'] | null>(null);
    const restoration = new Promise<void>(resolve => finishRestoration = resolve);
    let markGuardStarted: () => void;
    guardStarted = new Promise<void>(resolve => markGuardStarted = resolve);
    auth = jasmine.createSpyObj<AuthService>('AuthService', [
      'initialize', 'isLoggedIn', 'role',
    ]);
    auth.initialize.and.callFake(() => {
      // The first call comes from the app's real startup initializer.
      if (auth.initialize.calls.count() > 1) markGuardStarted();
      return restoration;
    });
    auth.isLoggedIn.and.callFake(computed(() => restoredRole() !== null));
    auth.role.and.callFake(restoredRole);

    const routes: Routes = [
      { path: '', component: PublicPage },
      { path: 'listings', component: PublicPage },
      { path: 'private', component: ProtectedPage, canActivate: [authGuard] },
      {
        path: 'owner/dashboard',
        component: ProtectedPage,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Owner'] },
      },
      { path: 'login', component: LoginPage, canActivate: [guestGuard] },
    ];
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        { provide: AuthService, useValue: auth },
      ],
    });
    // Replace the app routes, whose wildcard would otherwise catch test URLs.
    TestBed.overrideProvider(ROUTES, { useValue: [routes] });
  });

  afterEach(() => finishRestoration());

  it('renders a public page while the startup restoration is pending', async () => {
    const harness = await RouterTestingHarness.create('/');

    expect(harness.routeNativeElement?.textContent).toContain('Public page');
    expect(auth.initialize).toHaveBeenCalledTimes(1);
  });

  it('keeps a protected page pending until the session is restored', async () => {
    const harness = await RouterTestingHarness.create('/');
    const navigation = harness.navigateByUrl('/private', ProtectedPage);
    await guardStarted;

    expect(harness.routeNativeElement?.textContent).toContain('Public page');
    expect(auth.isLoggedIn).not.toHaveBeenCalled();

    restoredRole.set('Tenant');
    finishRestoration();
    await navigation;
    expect(harness.routeNativeElement?.textContent).toContain('Protected page');
  });

  it('redirects an anonymous visitor only after restoration finishes', async () => {
    const harness = await RouterTestingHarness.create('/');
    const navigation = harness.navigateByUrl('/private', LoginPage);
    await guardStarted;

    expect(harness.routeNativeElement?.textContent).toContain('Public page');
    finishRestoration();
    await navigation;

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeNativeElement?.textContent).toContain('Login page');
  });

  it('checks the restored role before allowing an owner route', async () => {
    const harness = await RouterTestingHarness.create('/');
    const navigation = harness.navigateByUrl('/owner/dashboard', PublicPage);
    await guardStarted;

    expect(auth.role).not.toHaveBeenCalled();
    restoredRole.set('Tenant');
    finishRestoration();
    await navigation;

    expect(TestBed.inject(Router).url).toBe('/listings');
  });

  it('waits on a direct login visit before redirecting a restored owner', async () => {
    const navigation = RouterTestingHarness.create('/login');
    await guardStarted;

    expect(auth.isLoggedIn).not.toHaveBeenCalled();
    restoredRole.set('Owner');
    finishRestoration();
    const harness = await navigation;

    expect(TestBed.inject(Router).url).toBe('/owner/dashboard');
    expect(harness.routeNativeElement?.textContent).toContain('Protected page');
  });
});
