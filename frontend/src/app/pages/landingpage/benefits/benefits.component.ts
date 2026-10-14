import { Component } from '@angular/core';
import { IconComponent } from '../shared/icon.component';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './benefits.component.html',
  styleUrl: './benefits.component.css',
})
export class BenefitsComponent {}
