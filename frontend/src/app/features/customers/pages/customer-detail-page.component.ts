import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Customer, CustomerDetailProfile } from '../../../core/models/customer.models';
import { CreateQuotePayload } from '../../../core/models/quote.models';
import { CustomerService } from '../../../core/services/customer.service';
import { QuoteService } from '../../../core/services/quote.service';

const DEFAULT_CUSTOMER_PROFILE: CustomerDetailProfile = {
  status: 'Actif',
  customerNumber: '-',
  balance: 0,
  overdueInvoicesCount: 0,
  overdueTotal: 0,
  contractCount: 0,
  activeContractsCount: 0,
  agency: 'Massira',
  category: 'Residentiel',
  segment: 'Residentiels',
  streetNumber: '-',
  addressComplement: '-',
  postalCode: '11000',
  country: 'MAR',
  commercial: {
    fullName: 'User Super',
    email: null,
    phone: null,
    agency: 'TEMAARA MASSIRA',
  },
  contractStatus: {
    prepaid: { active: 0, suspended: 0, terminated: 0 },
    postpaid: { active: 0, suspended: 0, terminated: 0 },
  },
  contracts: [],
  invoices: [],
  interactions: [],
};

@Component({
  selector: 'app-customer-detail-page',
  standalone: false,
  templateUrl: './customer-detail-page.component.html',
  styleUrl: './customer-detail-page.component.scss',
})
export class CustomerDetailPageComponent implements OnInit {
  customer: Customer | null = null;
  loading = true;
  quoteDialogOpen = false;
  creatingQuote = false;
  errorMessage = '';
  quoteErrorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly customerService: CustomerService,
    private readonly quoteService: QuoteService
  ) {}

  get profile(): CustomerDetailProfile {
    return this.customer?.profile ?? DEFAULT_CUSTOMER_PROFILE;
  }

  formatMoney(value: number): string {
    return `${value.toFixed(2)} Dh`;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Client introuvable.';
      this.loading = false;
      return;
    }

    this.customerService.getCustomer(id).subscribe({
      next: (customer) => {
        this.deferViewUpdate(() => {
          this.customer = customer;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.deferViewUpdate(() => {
          this.errorMessage = error.error?.message ?? error.message ?? 'Chargement de la fiche client impossible.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  openQuoteDialog(): void {
    this.quoteErrorMessage = '';
    this.quoteDialogOpen = true;
  }

  closeQuoteDialog(): void {
    if (this.creatingQuote) {
      return;
    }

    this.quoteDialogOpen = false;
    this.quoteErrorMessage = '';
  }

  createQuote(payload: CreateQuotePayload): void {
    this.deferViewUpdate(() => {
      this.creatingQuote = true;
      this.quoteErrorMessage = '';
      this.cdr.detectChanges();

      this.quoteService.createQuote(payload)
        .pipe(finalize(() => {
          this.creatingQuote = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: (quote) => {
            this.quoteDialogOpen = false;
            this.router.navigate(['/quotes', quote.id, 'catalog']);
          },
          error: (error) => {
            this.quoteErrorMessage = error.error?.message ?? error.message ?? 'Creation du panier impossible.';
            this.cdr.detectChanges();
          },
        });
    });
  }

  private deferViewUpdate(callback: () => void): void {
    Promise.resolve().then(() => {
      this.ngZone.run(callback);
    });
  }
}

