import { BenefitsComponent } from '../benefits/benefits.component';
import { FaqComponent } from '../faq/faq.component';
import { PricingComponent } from '../pricing/pricing.component';
import { FeaturesComponent } from '../features/features.component';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header.component';
import { FooterComponent } from '../shared/footer.component';
import { IconComponent } from '../shared/icon.component';
import { PreviewComponent } from '../preview/preview.component';
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    BenefitsComponent,
    PricingComponent,
    FaqComponent,
    FeaturesComponent,
    RouterLink,
    HeaderComponent,
    FooterComponent,
    IconComponent,
    PreviewComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  readonly steps = [
    {
      title: 'Start with your business.',
      text: 'Define what you do, who you serve, and what your website needs to achieve.',
    },
    {
      title: 'Make it feel like you.',
      text: 'The planned editor will help you shape your pages, content, and visual identity.',
    },
    {
      title: 'Launch. Then keep growing.',
      text: 'Publishing and ongoing website management are part of the product roadmap.',
    },
  ];
}
