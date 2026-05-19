import { Component, OnInit } from '@angular/core';
import { Offer } from '../../../core/models/offer.models';
import { AuthService } from '../../../core/services/auth.service';
import { OfferService } from '../../../core/services/offer.service';

@Component({
  selector: 'app-offers-page',
  standalone: false,
  templateUrl: './offers-page.component.html',
  styleUrl: './offers-page.component.scss',
})
export class OffersPageComponent implements OnInit {
  offers: Offer[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    public readonly authService: AuthService,
    private readonly offerService: OfferService
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading = true;
    this.offerService.getOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Chargement des offres impossible.';
        this.loading = false;
      },
    });
  }

  toggleOffer(offer: Offer): void {
    const request$ = offer.active
      ? this.offerService.deactivateOffer(offer.id)
      : this.offerService.activateOffer(offer.id);
    request$.subscribe({
      next: () => this.loadOffers(),
      error: (error) => this.errorMessage = error.error?.message ?? 'Changement de statut impossible.',
    });
  }
}
