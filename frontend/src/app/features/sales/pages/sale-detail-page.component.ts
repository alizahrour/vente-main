import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Offer } from '../../../core/models/offer.models';
import { Sale } from '../../../core/models/sale.models';
import { OfferService } from '../../../core/services/offer.service';
import { SaleService } from '../../../core/services/sale.service';

@Component({
  selector: 'app-sale-detail-page',
  standalone: false,
  templateUrl: './sale-detail-page.component.html',
  styleUrl: './sale-detail-page.component.scss',
})
export class SaleDetailPageComponent implements OnInit {
  sale: Sale | null = null;
  offers: Offer[] = [];
  errorMessage = '';
  successMessage = '';

  readonly itemForm = this.fb.nonNullable.group({
    offerId: [0, Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
  });

  readonly cancelForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.maxLength(255)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly saleService: SaleService,
    private readonly offerService: OfferService
  ) {}

  ngOnInit(): void {
    this.loadSale();
    this.offerService.getActiveOffers().subscribe({ next: (offers) => this.offers = offers });
  }

  get locked(): boolean {
    return !this.sale || this.sale.status !== 'DRAFT';
  }

  loadSale(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.saleService.getSale(id).subscribe({
      next: (sale) => this.sale = sale,
      error: (error) => this.errorMessage = error.error?.message ?? 'Vente introuvable.',
    });
  }

  addItem(): void {
    if (!this.sale || this.itemForm.invalid) return;
    this.saleService.addItem(this.sale.id, this.itemForm.getRawValue()).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.itemForm.reset({ offerId: 0, quantity: 1 });
      },
      error: (error) => this.errorMessage = error.error?.message ?? 'Ajout impossible.',
    });
  }

  removeItem(itemId: number): void {
    if (!this.sale) return;
    this.saleService.deleteItem(this.sale.id, itemId).subscribe({
      next: (sale) => this.sale = sale,
      error: (error) => this.errorMessage = error.error?.message ?? 'Suppression impossible.',
    });
  }

  validate(): void {
    if (!this.sale) return;
    this.saleService.validateSale(this.sale.id).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.successMessage = 'Vente validée.';
      },
      error: (error) => this.errorMessage = error.error?.message ?? 'Validation impossible.',
    });
  }

  cancel(): void {
    if (!this.sale || this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }
    this.saleService.cancelSale(this.sale.id, this.cancelForm.controls.reason.value).subscribe({
      next: (sale) => this.sale = sale,
      error: (error) => this.errorMessage = error.error?.message ?? 'Annulation impossible.',
    });
  }

  goPayment(): void {
    if (this.sale) this.router.navigate(['/sales', this.sale.id, 'payment']);
  }
}
