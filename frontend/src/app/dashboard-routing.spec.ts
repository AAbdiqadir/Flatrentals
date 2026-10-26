import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { AuthService } from './core/auth.service';
import { User } from './models/types';

describe('Dashboard and profile integration', () => {
  let role: User['role'];
  let loggedIn: boolean;
  let http: HttpTestingController;
  let auth: {
    isLoggedIn: () => boolean;
    role: () => User['role'];
    user: () => object;
    isSigningOut: () => boolean;
    sessionError: () => string;
    updateProfileDetails: jasmine.Spy;
    logout: jasmine.Spy;
  };
  const person = () => ({ id: 'account-1', fullName: 'Amina Hassan', email: 'amina@flatmail.test', role });

  beforeEach(() => {
    role = 'Tenant';
    loggedIn = true;
    auth = {
      isLoggedIn: () => loggedIn,
      role: () => role,
      user: () => ({ ...person(), userId: 'account-1', token: 'test-token' }),
      isSigningOut: () => false,
      sessionError: () => '',
      updateProfileDetails: jasmine.createSpy('updateProfileDetails'),
      logout: jasmine.createSpy('logout'),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting(), { provide: AuthService, useValue: auth }],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify({ ignoreCancelled: true }));

  for (const accountRole of ['Tenant', 'Owner', 'Admin'] as const) {
    it(`opens the styled ${accountRole} profile from its dashboard and saves to the real account endpoint`, async () => {
      role = accountRole;
      const base = '/' + role.toLowerCase();
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(base + '/dashboard');
      for (const request of http.match(() => true)) {
        request.flush(request.request.url.includes('/dashboard/') ? {} : []);
      }
      harness.detectChanges();
      const shell = harness.routeNativeElement!;
      expect(shell.querySelector('.ledger')).withContext('Dashboard must be wrapped by its shared shell').not.toBeNull();
      expect(getComputedStyle(shell.querySelector('.ledger')!).backgroundColor).withContext('The shared dashboard stylesheet must be loaded').toBe('rgb(255, 255, 255)');

      const link = shell.querySelector<HTMLAnchorElement>(`.ledger-desktop-nav a[href="${base}/profile"]`)!;
      expect(link).withContext('Profile must be reachable from dashboard navigation').not.toBeNull();
      link.click();
      await harness.fixture.whenStable();
      http.expectOne('/api/users/me').flush(person());
      harness.detectChanges();
      expect(TestBed.inject(Router).url).toBe(base + '/profile');
      expect(shell.querySelector('h1')?.textContent).toBe('My profile');
      expect(shell.querySelector('#profile-name')).not.toBeNull();
      expect(shell.querySelector('.ledger-neutral-badge')?.textContent?.trim()).toBe(role);

      const input = shell.querySelector<HTMLInputElement>('#profile-name')!;
      input.value = 'Amina Noor Hassan';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      harness.detectChanges();
      shell.querySelector<HTMLButtonElement>('#profile-form button[type="submit"]')!.click();
      const save = http.expectOne({ method: 'PUT', url: '/api/users/me' });
      expect(save.request.body).toEqual({ fullName: 'Amina Noor Hassan', email: person().email });
      save.flush({ ...person(), fullName: 'Amina Noor Hassan' });
      harness.detectChanges();
      expect(shell.querySelector('.ledger-save-status')?.textContent).toContain('Changes saved');
      expect(auth.updateProfileDetails).toHaveBeenCalledWith({ ...person(), fullName: 'Amina Noor Hassan' });
    });

    it(`exposes ${accountRole} profile links from the listings header on desktop and mobile`, async () => {
      role = accountRole;
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/listings');
      http.expectOne('/api/flats').flush([]);
      harness.detectChanges();
      const header = harness.routeNativeElement!.querySelector('app-header')!;
      const path = '/' + role.toLowerCase() + '/profile';
      expect(header.querySelector(`.desktop-nav a[href="${path}"]`)).not.toBeNull();
      header.querySelector<HTMLButtonElement>('.menu-toggle')!.click();
      harness.detectChanges();
      expect(header.querySelector<HTMLElement>('#mobile-navigation')!.hidden).toBeFalse();
      expect(header.querySelector(`#mobile-navigation a[href="${path}"]`)).not.toBeNull();
    });
  }

  it('redirects signed-out visitors to login instead of rendering a profile', async () => {
    loggedIn = false;
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tenant/profile');
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeNativeElement!.querySelector('#profile-form')).toBeNull();
  });

  it('prevents tenants from opening an admin profile route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/profile');
    http.expectOne('/api/flats').flush([]);
    expect(TestBed.inject(Router).url).toBe('/listings');
    expect(harness.routeNativeElement!.querySelector('#profile-form')).toBeNull();
  });
});
