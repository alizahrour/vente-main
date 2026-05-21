import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferCategory } from '../../../core/models/offer.models';
import { OfferService } from '../../../core/services/offer.service';

@Component({
  selector: 'app-offer-form-page',
  standalone: false,
  templateUrl: './offer-form-page.component.html',
  styleUrl: './offer-form-page.component.scss',
})
export class OfferFormPageComponent implements OnInit {
  offerId: number | null = null;
  errorMessage = '';
  saving = false;
  categories: OfferCategory[] = ['MOBILE', 'INTERNET', 'FIBRE', 'ADSL', 'BOX', 'RECHARGE'];
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly offerService: OfferService
  ) {
    this.form = this.fb.nonNullable.group({
      code: ['', [Validators.required, Validators.maxLength(40)]],
      name: ['', [Validators.required, Validators.maxLength(120)]],
      category: ['MOBILE' as OfferCategory, Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      duration: [30, [Validators.required, Validators.min(1)]],
      active: [true],
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.offerId = id;
      this.offerService.getOffer(id).subscribe({
        next: (offer) => this.form.patchValue({
          code: offer.code,
          name: offer.name,
          category: offer.category,
          description: offer.description ?? '',
          price: offer.price,
          duration: offer.duration,
          active: offer.active,
        }),
        error: (error) => this.errorMessage = error.error?.message ?? 'Offre introuvable.',
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    const payload = this.form.getRawValue();
    const request$ = this.offerId
      ? this.offerService.updateOffer(this.offerId, payload)
      : this.offerService.createOffer(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/offers']),
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Enregistrement impossible.';
        this.saving = false;
      },
    });
  }
}
