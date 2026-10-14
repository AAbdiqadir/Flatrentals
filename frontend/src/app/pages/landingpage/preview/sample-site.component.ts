import { Component, Input } from '@angular/core';
import { IconComponent } from '../shared/icon.component';

export interface ExampleWebsite {
  label: string;
  brand: string;
  headline: string;
  description: string;
  link: string;
  color: string;
  accent: string;
  ink: string;
  initials: string;
}

@Component({
  selector: 'app-sample-site',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './sample-site.component.html',
  styleUrl: './sample-site.component.css',
})
export class SampleSiteComponent {
  @Input({ required: true }) example!: ExampleWebsite;
  @Input() mobile = false;
}
