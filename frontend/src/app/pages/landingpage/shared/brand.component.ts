import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-brand',
  standalone: true,
  template: `<span class="brand" [class.compact]="compact"
    ><img
      src="assets/vision-glide-mark.svg"
      alt=""
      width="40"
      height="32"
    /><span class="brand-name">vision glide</span></span
  >`,
  styles: [
    `
      :host {
        display: inline-flex;
        flex-shrink: 0;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        line-height: 1;
      }
      .brand img {
        display: block;
        width: 34px;
        height: 28px;
      }
      .brand-name {
        font-size: 23px;
        font-weight: 700;
        letter-spacing: -0.035em;
      }
      .compact {
        gap: 5px;
      }
      .compact img {
        width: 24px;
        height: 20px;
      }
      .compact .brand-name {
        font-size: 13px;
      }
      @media (max-width: 700px) {
        .brand-name {
          font-size: 20px;
        }
        .brand img {
          width: 29px;
          height: 24px;
        }
        .compact .brand-name {
          font-size: 12px;
        }
        .compact img {
          width: 22px;
          height: 18px;
        }
      }
      @media (max-width: 380px) {
        .brand-name {
          font-size: 18px;
        }
        .brand img {
          width: 26px;
          height: 22px;
        }
        .brand {
          gap: 6px;
        }
        .compact .brand-name {
          font-size: 11px;
        }
      }
    `,
  ],
})
export class BrandComponent {
  @Input() compact = false;
}
