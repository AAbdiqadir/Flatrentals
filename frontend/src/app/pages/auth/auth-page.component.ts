import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {
  mode: 'login' | 'register' = 'login';
  error = '';
  
  form = this.fb.group({
    fullName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['Tenant'],
    rememberMe: [false]
  });

  constructor(
  private fb: FormBuilder,
  public readonly auth: AuthService,
  private router: Router,
  route: ActivatedRoute,
) {
  this.mode =
    route.snapshot.data['mode'] === 'register'
      ? 'register'
      : 'login';
}
  
  
  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {
  fullName,
  email,
  password,
  role,
  rememberMe
} = this.form.getRawValue();

const request$ = this.mode === 'login'
  ? this.auth.login(
      email!,
      password!,
      !!rememberMe
    )
  : this.auth.register(
      fullName!,
      email!,
      password!,
      role as 'Owner' | 'Tenant',
      !!rememberMe
    );
    request$.subscribe({
      next: () => this.navigateAfterAuth(),
      error: (err) => this.error = err?.error?.title ?? err?.error ?? 'Authentication failed'
    });
  }

  setMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.error = '';
    if (mode === 'login') {
      this.form.patchValue({ fullName: '', role: 'Tenant' });
    }
  }

  private navigateAfterAuth() {
    const role = this.auth.role();
    if (role === 'Admin') {
      this.router.navigateByUrl('/admin/dashboard');
      return;
    }
    if (role === 'Owner') {
      this.router.navigateByUrl('/owner/dashboard');
      return;
    }
    this.router.navigateByUrl('/tenant/dashboard');
  }
}
