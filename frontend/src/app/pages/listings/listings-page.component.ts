import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Flat } from '../../models/types';
import { environment } from '../../../environments/environment';
import { HeaderComponent } from '../landingpage/shared/header.component';

@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  templateUrl: './listings-page.component.html',
  styleUrl: './listings-page.component.css'
})
export class ListingsPageComponent implements OnInit {
  flats: Flat[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getFlats().subscribe((res) => this.flats = res);
  }

  imageUrl(url?: string, width = 800): string {
    if (!url) return '';

    const apiBase = environment.apiUrl.replace(/\/api\/?$/, '');
    const resolved = url.startsWith('http')
      ? url
      : `${apiBase}${url}`;

    const image = new URL(resolved);

    if (image.hostname === 'images.unsplash.com') {
      image.searchParams.set('w', String(width));
      image.searchParams.set('auto', 'format');
      image.searchParams.set('q', '85');
    }

    return image.toString();
  }
}
