import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Flat } from '../../models/types';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listings-page.component.html',
  styleUrl: './listings-page.component.css'
})
export class ListingsPageComponent implements OnInit {
  flats: Flat[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getFlats().subscribe((res) => this.flats = res);
  }

  imageUrl(url?: string) {
    if (!url) { return ''; }
    const apiBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return url.startsWith('http') ? url : `${apiBase}${url}`;
  }
}
