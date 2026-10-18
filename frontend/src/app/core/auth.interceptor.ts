import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(`${environment.apiUrl}/`)) {
    return next(req);
  }

  

  const sessionEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
    '/faceauth/login'
  ];
  const path = req.url
    .slice(environment.apiUrl.length)
    .split('?')[0];

  if (sessionEndpoints.includes(path)) {
    return next(req.clone({
      withCredentials: true,
      setHeaders: {
        'X-Session-Request': '1'
      }
    }));
  }

  const auth = inject(AuthService);

  return auth.getValidToken().pipe(
    switchMap(token => {
      const authorized = token
        ? req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          })
        : req;

      return next(authorized).pipe(
        catchError((error: unknown) => {
          if (
            !(error instanceof HttpErrorResponse) ||
            error.status !== 401 ||
            !token ||
            auth.isSigningOut()
          ) {
            return throwError(() => error);
          }

          // Another API request may already have refreshed it.
          const latest = auth.getToken();

          if (latest && latest !== token) {
            return next(req.clone({
              setHeaders: {
                Authorization: `Bearer ${latest}`
              }
            }));
          }

          return auth.refreshSession().pipe(
            switchMap(response =>
              next(req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.token}`
                }
              }))
            )
          );
        })
      );
    })
  );
};