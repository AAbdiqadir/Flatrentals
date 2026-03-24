import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-flat-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flat-form-page.component.html',
  styleUrl: './flat-form-page.component.css'
})
export class FlatFormPageComponent implements OnInit {
  flatId?: number;
  files: File[] = [];

  form = this.fb.group({
    address: ['', Validators.required],
    city: ['', Validators.required],
    description: ['', Validators.required],
    rentPrice: [0, [Validators.required, Validators.min(1)]],
    rooms: [1, [Validators.required, Validators.min(1)]],
    bathrooms: [1],
    isAvailable: [true]
  });

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.flatId = Number(id);
    this.api.getFlat(this.flatId).subscribe((flat) => {
      this.form.patchValue({
        address: flat.address,
        city: flat.city,
        description: flat.description,
        rentPrice: flat.rentPrice,
        rooms: flat.rooms,
        bathrooms: flat.bathrooms ?? 1,
        isAvailable: flat.isAvailable
      });
    });
  }

  onFilesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.files = Array.from(input.files ?? []);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = new FormData();
    const value = this.form.getRawValue();
    Object.entries(value).forEach(([key, val]) => data.append(key, String(val)));
    this.files.forEach((file) => data.append('images', file));

    const request$ = this.flatId
      ? this.api.updateFlat(this.flatId, data)
      : this.api.createFlat(data);

    request$.subscribe(() => this.router.navigateByUrl('/owner/dashboard'));
  }
}
