import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandComponent } from './brand.component';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, BrandComponent],
  template: `<footer class="container footer">
    <div>
      <a class="wordmark" routerLink="/" aria-label="Vision Glide home"
        ><app-brand
      /></a>
      <p>A home for your next chapter.</p>
    </div>
    <nav aria-label="Footer navigation">
      <a routerLink="/" fragment="product">Product</a
      ><a routerLink="/" fragment="how-it-works">How it works</a
      ><a routerLink="/" fragment="pricing">Pricing</a
      ><a routerLink="/" fragment="faq">FAQ</a>
    </nav>
    <p class="footer-note">
      Vision Glide.<br /><span>Built for what comes next.</span>
    </p>
  </footer>`,
  styles: [
    `
      .footer {
        padding-block: 46px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 32px;
      }
      .footer p {
        font-size: 12px;
        color: var(--color-muted);
        margin: 14px 0 0;
      }
      .footer nav {
        display: flex;
        gap: 24px;
        font-size: 12px;
        padding-top: 12px;
      }
      .footer nav a {
        padding-block: 10px;
      }
      .footer-note {
        text-align: right;
        line-height: 1.9;
      }
      .footer-note span {
        font-size: 11px;
      }
      @media (max-width: 700px) {
        .footer {
          flex-wrap: wrap;
        }
        .footer nav {
          width: 100%;
          order: 2;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-note {
          text-align: left;
        }
      }
    `,
  ],
})
export class FooterComponent {}
