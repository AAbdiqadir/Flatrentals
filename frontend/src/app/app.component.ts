import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  goHomeByRole() {
    const role = this.auth.role();
    if (role === 'Admin') {
      this.router.navigateByUrl('/admin/dashboard');
      return;
    }
    if (role === 'Owner') {
      this.router.navigateByUrl('/owner/dashboard');
      return;
    }
    if (role === 'Tenant') {
      this.router.navigateByUrl('/tenant/dashboard');
      return;
    }
    this.router.navigateByUrl('/listings');
  }
}
