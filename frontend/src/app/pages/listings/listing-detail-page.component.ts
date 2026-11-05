import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Flat } from '../../models/types';
import { environment } from '../../../environments/environment';
import { HeaderComponent } from '../landingpage/shared/header.component';

@Component({
  selector: 'app-listing-detail-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,HeaderComponent],
  templateUrl: './listing-detail-page.component.html',
  styleUrl: './listing-detail-page.component.css'
})
export class ListingDetailPageComponent implements OnInit {
  flat?: Flat;
  message = '';

  bookingForm = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    paymentReference: ['', Validators.required]
  });

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getFlat(id).subscribe((res) => this.flat = res);
  }

  createBooking() {
    if (!this.flat || this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.api.createBooking({
      flatId: this.flat.id,
      startDate: this.bookingForm.value.startDate!,
      endDate: this.bookingForm.value.endDate!,
      paymentReference: this.bookingForm.value.paymentReference!
    }).subscribe(() => this.message = 'Booking request submitted.');
  }

  sendMessage(bodyInput: HTMLTextAreaElement) {
    if (!this.flat || !bodyInput.value.trim()) {
      return;
    }

    this.api.sendMessage({
      flatId: this.flat.id,
      recipientId: this.flat.ownerId,
      body: bodyInput.value.trim()
    }).subscribe(() => {
      this.message = 'Message sent.';
      bodyInput.value = '';
    });
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
