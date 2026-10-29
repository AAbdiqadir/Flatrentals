import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthResponse } from '../models/types';
import { AuthService } from './auth.service';

describe('Session initialization', () => {
  let auth: AuthService;
  let restoration: Subject<AuthResponse>;
  let refresh: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
    });
    auth = TestBed.inject(AuthService);
    restoration = new Subject<AuthResponse>();
    refresh = spyOn(auth, 'refreshSession').and.returnValue(restoration);
  });

  it('shares one pending restoration between startup and guards', async () => {
    let settled = false;
    const startup = auth.initialize();
    void startup.then(() => settled = true);

    expect(auth.initialize()).toBe(startup);
    await Promise.resolve();
    expect(settled).toBeFalse();
    expect(refresh).toHaveBeenCalledTimes(1);

    restoration.next({
      token: 'restored-token',
      userId: '1',
      email: 'owner@example.com',
      fullName: 'Owner',
      role: 'Owner',
      expiresAt: '2099-01-01T00:00:00Z',
    });
    await startup;
    expect(settled).toBeTrue();
    expect(auth.initialize()).toBe(startup);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('settles anonymously after a failed restoration without retrying on navigation', async () => {
    const startup = auth.initialize();
    restoration.error(new Error('Session unavailable'));

    await expectAsync(startup).toBeResolved();
    expect(auth.isLoggedIn()).toBeFalse();
    expect(auth.initialize()).toBe(startup);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
