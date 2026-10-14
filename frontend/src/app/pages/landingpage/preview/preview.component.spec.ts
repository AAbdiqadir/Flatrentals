import { TestBed } from '@angular/core/testing';
import { PreviewComponent } from './preview.component';

describe('Website concept preview', () => {
  it('switches the example business and keeps one selection active', () => {
    const fixture = TestBed.createComponent(PreviewComponent);
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.preview-selector button'),
    );
    buttons[1].click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.sample-nav').textContent,
    ).toContain('North & Co.');
    expect(
      buttons.filter((button) => button.getAttribute('aria-pressed') === 'true')
        .length,
    ).toBe(1);
  });

  it('changes preview width without losing the business selection', () => {
    const fixture = TestBed.createComponent(PreviewComponent);
    fixture.componentInstance.selected.set(2);
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[aria-label="Mobile preview"]')
      .click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('.sample-site')
        .classList.contains('mobile-preview'),
    ).toBeTrue();
    expect(
      fixture.nativeElement.querySelector('.sample-nav').textContent,
    ).toContain('Everyday Objects');
  });
});
