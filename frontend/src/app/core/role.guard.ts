import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as string[];

  await auth.initialize();

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (allowedRoles.includes(auth.role() ?? '')) {
    return true;
  }

  return router.createUrlTree(['/listings']);
};
