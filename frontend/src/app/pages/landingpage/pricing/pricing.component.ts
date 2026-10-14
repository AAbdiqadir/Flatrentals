import { Component } from '@angular/core';
import { IconComponent } from '../shared/icon.component';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent {
  readonly plans = [
    {
      name: 'Launch',
      purpose: 'For your first online chapter.',
      items: [
        'Establish your online presence',
        'Introduce your business',
        'Create a clear path to contact',
      ],
    },
    {
      name: 'Grow',
      purpose: 'For a business finding its stride.',
      items: [
        'Build out your website content',
        'Evolve your brand and pages',
        'Keep your online presence current',
      ],
    },
    {
      name: 'Scale',
      purpose: 'For your next stage of ambition.',
      items: [
        'Support a broader website',
        'Plan for changing business needs',
        'Discuss your requirements',
      ],
    },
  ];
}
