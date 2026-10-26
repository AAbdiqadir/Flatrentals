import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { User } from '../../models/types';
import { DashboardResource, accountInitials, requestError } from '../../shared/dashboard/dashboard-data';
import { ResourceStateComponent } from '../../shared/dashboard/resource-state.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, ResourceStateComponent],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly auth = inject(AuthService);
  readonly initials = accountInitials;
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly saved = signal(false);
  readonly account = new DashboardResource(() => this.api.getMe(), this.destroyRef);
  readonly form = inject(FormBuilder).nonNullable.group({
    fullName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
  });

  constructor() { this.load(); }

  load(): void {
    if (this.account.loading()) return;
    // Loading through this observable also establishes the form's saved baseline.
    this.account.error.set('');
    this.account.loading.set(true);
    this.api.getMe().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.account.loading.set(false)),
    ).subscribe({
      next: user => { this.account.data.set(user); this.reset(); this.auth.updateProfileDetails(user); },
      error: error => this.account.error.set(requestError(error, 'Could not load your profile. Please try again.')),
    });
  }

  reset(): void {
    const user = this.account.data();
    if (user) this.form.reset({ fullName: user.fullName, email: user.email });
    this.saveError.set('');
    this.saved.set(false);
  }

  save(): void {
    if (this.saving() || !this.account.data()) return;
    this.form.markAllAsTouched();
    this.saved.set(false);
    this.saveError.set('');
    if (this.form.invalid) {
      requestAnimationFrame(() => document.querySelector<HTMLInputElement>('#profile-form [aria-invalid="true"]')?.focus());
      return;
    }
    const values = this.form.getRawValue();
    const payload = { fullName: values.fullName.trim(), email: values.email.trim() };
    this.saving.set(true);
    this.form.disable({ emitEvent: false });
    this.api.updateMe(payload).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.saving.set(false); this.form.enable({ emitEvent: false }); }),
    ).subscribe({
      next: (user: User) => {
        this.account.data.set(user);
        this.form.reset({ fullName: user.fullName, email: user.email });
        this.auth.updateProfileDetails(user);
        this.saved.set(true);
      },
      error: error => this.saveError.set(requestError(error, 'Your changes could not be saved. Please try again.')),
    });
  }

  roleDescription(role: User['role']): string {
    switch (role) {
      case 'Admin': return 'Manage users, flats and bookings across FlatRental.';
      case 'Owner': return 'Manage your flats and respond to incoming booking requests.';
      case 'Tenant': return 'Browse available flats and manage your booking requests.';
    }
  }
}
