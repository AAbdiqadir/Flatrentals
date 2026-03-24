import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';
import { AuthPageComponent } from './pages/auth/auth-page.component';
import { ListingDetailPageComponent } from './pages/listings/listing-detail-page.component';
import { ListingsPageComponent } from './pages/listings/listings-page.component';
import { DashboardTenantComponent } from './pages/dashboard-tenant/dashboard-tenant.component';
import { DashboardOwnerComponent } from './pages/dashboard-owner/dashboard-owner.component';
import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin.component';
import { FlatFormPageComponent } from './pages/flat-form/flat-form-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'listings' },
  { path: 'login', component: AuthPageComponent },
  { path: 'register', component: AuthPageComponent },
  { path: 'listings', component: ListingsPageComponent },
  { path: 'listings/:id', component: ListingDetailPageComponent },

  { path: 'tenant/dashboard', component: DashboardTenantComponent, canActivate: [authGuard, roleGuard], data: { roles: ['Tenant'] } },

  { path: 'owner/dashboard', component: DashboardOwnerComponent, canActivate: [authGuard, roleGuard], data: { roles: ['Owner'] } },
  { path: 'owner/flats/new', component: FlatFormPageComponent, canActivate: [authGuard, roleGuard], data: { roles: ['Owner', 'Admin'] } },
  { path: 'owner/flats/:id/edit', component: FlatFormPageComponent, canActivate: [authGuard, roleGuard], data: { roles: ['Owner', 'Admin'] } },

  { path: 'admin/dashboard', component: DashboardAdminComponent, canActivate: [authGuard, roleGuard], data: { roles: ['Admin'] } },

  { path: '**', redirectTo: 'listings' }
];
