import { Component } from '@angular/core';
import { IconComponent } from '../shared/icon.component';
@Component({
  selector: 'app-features',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css',
})
export class FeaturesComponent {}
