import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HeaderComponent } from './header.component';

describe('Mobile navigation', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] }),
  );
  it('opens and closes with Escape while keeping ARIA state accurate', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector(
      '.menu-toggle',
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(
      fixture.nativeElement.querySelector('#mobile-navigation').hidden,
    ).toBeFalse();
    const menuLink = fixture.nativeElement.querySelector(
      '#mobile-navigation a',
    ) as HTMLAnchorElement;
    menuLink.focus();
    expect(document.activeElement).toBe(menuLink);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(
      fixture.nativeElement.querySelector('#mobile-navigation').hidden,
    ).toBeTrue();
    expect(document.activeElement).toBe(toggle);
  });
});
