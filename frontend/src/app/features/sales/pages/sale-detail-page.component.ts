import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  selectedOffer: Offer | null = null;
  selectedCategory = 'RECHARGE';
  viewMode: 'catalog' | 'product' | 'quote' = 'catalog';
  errorMessage = '';
  successMessage = '';

  readonly itemForm;
  readonly cancelForm;
  readonly categories = [
    { label: 'MOBILE', children: ['Poste Telephonique', 'Recharge', 'Service', 'PACK', 'Carte', 'Pochette'] },
    { label: 'FIXE', children: ['PACK', 'Accessoires'] },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly saleService: SaleService,
    private readonly offerService: OfferService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.itemForm = this.fb.nonNullable.group({
      offerId: [0, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
    this.cancelForm = this.fb.nonNullable.group({
      reason: ['', [Validators.required, Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    this.loadSale();
    this.offerService.getActiveOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        this.cdr.detectChanges();
      },
    });
  }

  get locked(): boolean {
    return !this.sale || this.sale.status !== 'DRAFT';
  }

  get visibleOffers(): Offer[] {
    if (this.selectedCategory === 'RECHARGE') {
      return this.offers.filter((offer) => offer.category === 'RECHARGE' || offer.name.toUpperCase().includes('RECHARGE'));
    }
    return this.offers;
  }

  get quoteTotal(): number {
    return this.sale?.totalAmount ?? 0;
  }

  loadSale(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.saleService.getSale(id).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.viewMode = sale.items.length > 0 || sale.status !== 'DRAFT' ? 'quote' : 'catalog';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Vente introuvable.';
        this.cdr.detectChanges();
      },
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category.toUpperCase();
    this.viewMode = 'catalog';
    this.selectedOffer = null;
  }

  openProduct(offer: Offer): void {
    this.selectedOffer = offer;
    this.itemForm.patchValue({ offerId: offer.id, quantity: 1 });
    this.viewMode = 'product';
  }

  backToCatalog(): void {
    this.viewMode = 'catalog';
    this.selectedOffer = null;
  }

  showQuote(): void {
    this.viewMode = 'quote';
    this.selectedOffer = null;
  }

  addItem(): void {
    if (!this.sale || this.itemForm.invalid) return;
    this.saleService.addItem(this.sale.id, this.itemForm.getRawValue()).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.successMessage = 'Produit ajoute au devis.';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Ajout impossible.';
        this.cdr.detectChanges();
      },
    });
  }

  addSelectedOffer(): void {
    if (!this.selectedOffer) return;
    this.itemForm.patchValue({ offerId: this.selectedOffer.id });
    this.addItem();
  }

  removeItem(itemId: number): void {
    if (!this.sale) return;
    this.saleService.deleteItem(this.sale.id, itemId).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Suppression impossible.';
        this.cdr.detectChanges();
      },
    });
  }

  validate(): void {
    if (!this.sale) return;
    this.saleService.validateSale(this.sale.id).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.successMessage = 'Commande validee.';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Validation impossible.';
        this.cdr.detectChanges();
      },
    });
  }

  validateAndGoPayment(): void {
    if (!this.sale) return;
    if (this.sale.status === 'VALIDATED') {
      this.goPayment();
      return;
    }
    this.saleService.validateSale(this.sale.id).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.router.navigate(['/sales', sale.id, 'payment']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Validation impossible.';
        this.cdr.detectChanges();
      },
    });
  }

  cancel(): void {
    if (!this.sale || this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }
    this.saleService.cancelSale(this.sale.id, this.cancelForm.controls.reason.value).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Annulation impossible.';
        this.cdr.detectChanges();
      },
    });
  }

  goPayment(): void {
    if (this.sale) this.router.navigate(['/sales', this.sale.id, 'payment']);
  }
}
