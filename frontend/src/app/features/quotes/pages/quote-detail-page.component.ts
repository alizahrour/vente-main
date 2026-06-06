import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Quote } from '../../../core/models/quote.models';
import { QuoteService } from '../../../core/services/quote.service';

@Component({
  selector: 'app-quote-detail-page',
  standalone: false,
  templateUrl: './quote-detail-page.component.html',
  styleUrl: './quote-detail-page.component.scss',
})
export class QuoteDetailPageComponent implements OnInit {
  quote: Quote | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly quoteService: QuoteService
  ) {}

  ngOnInit(): void {
    const quoteId = Number(this.route.snapshot.paramMap.get('quoteId'));
    if (!quoteId) {
      this.errorMessage = 'Devis introuvable.';
      this.loading = false;
      return;
    }

    this.quoteService.getQuote(quoteId).subscribe({
      next: (quote) => {
        this.quote = quote;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? error.message ?? 'Chargement du devis impossible.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  backToCatalog(): void {
    if (this.quote) {
      this.router.navigate(['/quotes', this.quote.id, 'catalog']);
    }
  }
}
