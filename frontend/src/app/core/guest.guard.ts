import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.initialize();

  if (!auth.isLoggedIn()) {
    return true;
  }

  switch (auth.role()) {
    case 'Tenant':
      return router.createUrlTree(['/tenant/dashboard']);
    case 'Owner':
      return router.createUrlTree(['/owner/dashboard']);
    case 'Admin':
      return router.createUrlTree(['/admin/dashboard']);
    default:
      return router.createUrlTree(['/listings']);
  }
};
