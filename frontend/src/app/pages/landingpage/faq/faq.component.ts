import { Component } from '@angular/core';
import { IconComponent } from '../shared/icon.component';
@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
})
export class FaqComponent {
  readonly faqs = [
    {
      question: 'What is Vision Glide?',
      answer:
        'Vision Glide is a website platform in development for entrepreneurs and growing businesses. The goal is to help you create, launch, and manage a professional website as your business evolves.',
    },
    {
      question: 'Can I build and publish a website today?',
      answer:
        'Not yet. This page introduces the product direction. The preview is interactive, but the editor, publishing tools, and account service have not launched.',
    },
    {
      question: 'Do I need to know how to code?',
      answer:
        'The planned experience is intended for business owners, with a visual approach to creating and updating a website. The final editing tools and supported customization options are still being defined.',
    },
    {
      question: 'Can I use my own domain?',
      answer:
        'Domain connection is a planned consideration, not an available feature. Supported domain options and setup instructions will be confirmed before launch.',
    },
    {
      question: 'How much will it cost?',
      answer:
        'Pricing has not been announced. Launch, Grow, and Scale are illustrative plan names; they are not purchasable plans or confirmed feature bundles.',
    },
    {
      question: 'Can I sell products or move an existing website?',
      answer:
        'The shop preview is a visual example, not a working storefront. Commerce, migration, and third-party integrations have not been confirmed. Availability will be documented when the product launches.',
    },
  ];
}
