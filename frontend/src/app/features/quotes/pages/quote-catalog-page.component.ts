import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Offer, PageResponse } from '../../../core/models/offer.models';
import { Quote } from '../../../core/models/quote.models';
import { OfferService } from '../../../core/services/offer.service';
import { QuoteService } from '../../../core/services/quote.service';

interface CatalogCategorySection {
  label: string;
  items: CatalogCategoryItem[];
}

interface CatalogCategoryItem {
  label: string;
  hierarchyCode?: string;
  productTypeCode?: string;
  bundle?: boolean | null;
}

@Component({
  selector: 'app-quote-catalog-page',
  standalone: false,
  templateUrl: './quote-catalog-page.component.html',
  styleUrl: './quote-catalog-page.component.scss',
})
export class QuoteCatalogPageComponent implements OnInit, OnDestroy {
  quote: Quote | null = null;
  quoteId = 0;
  offers: Offer[] = [];
  selectedOffer: Offer | null = null;
  searchTerm = '';
  selectedCategoryLabel = '';
  selectedHierarchyCode = '';
  selectedProductTypeCode = '';
  selectedBundle: boolean | null = null;
  totalElements = 0;
  totalPages = 0;
  page = 0;
  size = 20;
  loadingQuote = true;
  loadingOffers = false;
  errorMessage = '';

  readonly categories: CatalogCategorySection[] = [
    {
      label: 'MOBILE',
      items: [
        { label: 'Poste Telephonique', productTypeCode: 'POSTEL' },
        { label: 'Poste seul', productTypeCode: 'POSTEL', bundle: false },
        { label: 'poste bundle', hierarchyCode: 'PAC', bundle: true },
        { label: 'Accessoires', hierarchyCode: 'ACCM' },
        { label: 'Recharge', hierarchyCode: 'RECH' },
        { label: 'Offre Digital', hierarchyCode: 'RECHDI' },
        { label: 'Recharge physique', hierarchyCode: 'RECHPH' },
        { label: 'Service', hierarchyCode: 'SERV' },
        { label: 'PACK', hierarchyCode: 'PAC' },
        { label: 'Carte', hierarchyCode: 'CART' },
        { label: 'Pochette', hierarchyCode: 'POCH' },
      ],
    },
    {
      label: 'FIXE',
      items: [
        { label: 'PACK', hierarchyCode: 'PACF' },
        { label: 'Accessoires', hierarchyCode: 'ACCPS' },
      ],
    },
  ];

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly quoteService: QuoteService,
    private readonly offerService: OfferService
  ) {}

  ngOnInit(): void {
    this.quoteId = Number(this.route.snapshot.paramMap.get('quoteId'));
    if (!this.quoteId) {
      this.errorMessage = 'Devis introuvable.';
      this.loadingQuote = false;
      return;
    }

    this.loadQuote();
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  get currentRangeStart(): number {
    return this.totalElements === 0 ? 0 : this.page * this.size + 1;
  }

  get currentRangeEnd(): number {
    return this.totalElements === 0 ? 0 : Math.min((this.page + 1) * this.size, this.totalElements);
  }

  loadQuote(): void {
    this.loadingQuote = true;
    this.quoteService.getQuote(this.quoteId).subscribe({
      next: (quote) => {
        this.quote = quote;
        this.loadingQuote = false;
        this.loadOffers(true);
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? error.message ?? 'Chargement du devis impossible.';
        this.loadingQuote = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadOffers(resetPage = false): void {
    if (!this.quoteId) {
      return;
    }
    if (resetPage) {
      this.page = 0;
    }

    this.loadingOffers = true;
    this.offerService.getEligibleOffers({
      quoteId: this.quoteId,
      page: this.page,
      size: this.size,
      search: this.searchTerm.trim() || undefined,
      hierarchyCode: this.selectedHierarchyCode || undefined,
      productTypeCode: this.selectedProductTypeCode || undefined,
      bundle: this.selectedBundle,
    }).subscribe({
      next: (response) => this.applyOfferResponse(response),
      error: (error) => {
        this.errorMessage = error.error?.message ?? error.message ?? 'Chargement du catalogue impossible.';
        this.loadingOffers = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSearchInput(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      this.loadOffers(true);
    }, 250);
  }

  selectCategory(item: CatalogCategoryItem): void {
    this.selectedCategoryLabel = item.label;
    this.selectedHierarchyCode = item.hierarchyCode ?? '';
    this.selectedProductTypeCode = item.productTypeCode ?? '';
    this.selectedBundle = item.bundle ?? null;
    this.loadOffers(true);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryLabel = '';
    this.selectedHierarchyCode = '';
    this.selectedProductTypeCode = '';
    this.selectedBundle = null;
    this.selectedOffer = null;
    this.loadOffers(true);
  }

  openDetails(offer: Offer): void {
    this.selectedOffer = this.selectedOffer?.id === offer.id ? null : offer;
  }

  previousPage(): void {
    if (this.page === 0) {
      return;
    }
    this.page--;
    this.loadOffers();
  }

  nextPage(): void {
    if (this.page + 1 >= this.totalPages) {
      return;
    }
    this.page++;
    this.loadOffers();
  }

  goToQuoteDetail(): void {
    this.router.navigate(['/quotes', this.quoteId]);
  }

  trackByOfferId(_: number, offer: Offer): number {
    return offer.id;
  }

  private applyOfferResponse(response: PageResponse<Offer>): void {
    this.offers = response.content;
    this.totalElements = response.totalElements;
    this.totalPages = response.totalPages;
    this.loadingOffers = false;

    if (this.selectedOffer && !this.offers.some((offer) => offer.id === this.selectedOffer?.id)) {
      this.selectedOffer = null;
    }

    this.cdr.detectChanges();
  }
}
