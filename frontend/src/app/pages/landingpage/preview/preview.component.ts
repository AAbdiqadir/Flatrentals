import { Component, computed, signal } from '@angular/core';
import { SampleSiteComponent } from './sample-site.component';
import { IconComponent } from '../shared/icon.component';
import { BrandComponent } from '../shared/brand.component';
@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [IconComponent, SampleSiteComponent, BrandComponent],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.css',
})
export class PreviewComponent {
  readonly selected = signal(0);
  readonly mobile = signal(false);
  readonly examples = [
    {
      label: 'Creative studio',
      brand: 'Olive Studio',
      headline: 'Good things\ntake shape.',
      description: 'Thoughtful design for businesses with something to say.',
      link: 'Explore our work',
      color: '#eee6d9',
      accent: '#53634d',
      ink: '#263129',
      initials: 'OS',
    },
    {
      label: 'Service business',
      brand: 'North & Co.',
      headline: 'A fresh\nperspective.',
      description: 'A considered approach to the spaces you call home.',
      link: 'Meet the studio',
      color: '#e0e8eb',
      accent: '#3f6677',
      ink: '#253943',
      initials: 'N&',
    },
    {
      label: 'Shop concept',
      brand: 'Everyday Objects',
      headline: 'Less, but\nbetter.',
      description: 'Considered essentials for a more intentional everyday.',
      link: 'Discover the collection',
      color: '#f0e1d9',
      accent: '#986650',
      ink: '#493129',
      initials: 'EO',
    },
  ];
  readonly example = computed(() => this.examples[this.selected()]);
}
