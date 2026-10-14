import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    @switch (name) {
      @case ('arrow') {
        <path d="M5 12h14m-6-6 6 6-6 6" />
      }
      @case ('check') {
        <path d="m5 12 4 4L19 6" />
      }
      @case ('menu') {
        <path d="M4 7h16M4 12h16M4 17h16" />
      }
      @case ('close') {
        <path d="m6 6 12 12M6 18 18 6" />
      }
      @case ('desktop') {
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      }
      @case ('mobile') {
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      }
      @case ('plus') {
        <path d="M12 5v14M5 12h14" />
      }
      @case ('page') {
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      }
      @case ('palette') {
        <circle cx="12" cy="12" r="9" />
        <circle cx="9" cy="8" r=".5" />
        <circle cx="15" cy="8" r=".5" />
        <path d="M7 13h10m-5 0v7" />
      }
      @case ('globe') {
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      }
      @case ('chevron') {
        <path d="m8 10 4 4 4-4" />
      }
      @case ('spark') {
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
      }
    }
  </svg>`,
  styles: [
    ':host{display:inline-flex;width:20px;height:20px;flex-shrink:0}svg{width:100%;height:100%}',
  ],
})
export class IconComponent {
  @Input() name = 'arrow';
}
