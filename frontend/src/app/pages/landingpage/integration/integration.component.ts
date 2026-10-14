import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header.component';
import { FooterComponent } from '../shared/footer.component';
import { IconComponent } from '../shared/icon.component';
@Component({
  selector: 'app-integration',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, IconComponent],
  template: `<a class="skip-link" href="#main-content">Skip to content</a
    ><app-header />
    <main id="main-content" class="container integration">
      <span class="integration-symbol" aria-hidden="true"
        ><app-icon name="spark"
      /></span>
      <h1>
        {{
          isLogin
            ? 'Account access is coming soon.'
            : 'Your next chapter is taking shape.'
        }}
      </h1>
      <p>
        Vision Glide is currently in development.
        {{
          isLogin
            ? 'Login is not available yet.'
            : 'Website creation and account signup are not available yet.'
        }}
        This page introduces the planned platform; it doesn’t create an account
        or collect your information.
      </p>
      <div class="integration-status">
        <span class="status-dot" aria-hidden="true"></span
        >{{ isLogin ? 'Login service pending' : 'Signup service pending' }}
      </div>
      <a routerLink="/" fragment="product" class="button button-dark"
        >Explore the concept <app-icon name="arrow" /></a
      ><a routerLink="/" fragment="faq" class="text-link">Read the FAQ</a>
    </main>
    <app-footer />`,
  styles: [
    `
      .integration {
        min-height: 65vh;
        max-width: 680px;
        text-align: center;
        padding-block: 80px;
      }
      .integration-symbol {
        display: inline-flex;
        width: 60px;
        height: 60px;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        background: var(--color-sage);
        color: var(--color-green);
        margin-bottom: 26px;
      }
      .integration-symbol app-icon {
        width: 28px;
        height: 28px;
      }
      .integration h1 {
        font-size: clamp(36px, 5vw, 54px);
        line-height: 1.15;
        letter-spacing: -0.035em;
      }
      .integration > p {
        margin: 24px auto;
        max-width: 54ch;
        font-size: 15px;
      }
      .integration-status {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: var(--color-muted);
        margin-bottom: 28px;
      }
      .text-link {
        display: block;
        font-size: 13px;
        margin-top: 20px;
        padding: 12px;
      }
    `,
  ],
})
export class IntegrationComponent {
  readonly isLogin = inject(ActivatedRoute).snapshot.data['action'] === 'login';
}
