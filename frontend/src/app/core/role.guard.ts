import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as string[];

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (allowedRoles.includes(auth.role() ?? '')) {
    return true;
  }

  return router.createUrlTree(['/listings']);
};
