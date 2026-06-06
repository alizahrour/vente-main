import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Offer } from '../../../core/models/offer.models';
import { Quote } from '../../../core/models/quote.models';
import { OfferService } from '../../../core/services/offer.service';
import { QuoteService } from '../../../core/services/quote.service';
import { SharedModule } from '../../../shared/shared.module';
import { QuoteCatalogPageComponent } from './quote-catalog-page.component';

describe('QuoteCatalogPageComponent', () => {
  let fixture: ComponentFixture<QuoteCatalogPageComponent>;
  let component: QuoteCatalogPageComponent;
  let offerService: jasmine.SpyObj<OfferService>;

  beforeEach(async () => {
    offerService = jasmine.createSpyObj<OfferService>('OfferService', ['getEligibleOffers']);
    offerService.getEligibleOffers.and.returnValue(of(buildPage([buildOffer()])));

    await TestBed.configureTestingModule({
      declarations: [QuoteCatalogPageComponent],
      imports: [SharedModule, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: new Map([['quoteId', '42']]),
            },
          },
        },
        {
          provide: QuoteService,
          useValue: jasmine.createSpyObj<QuoteService>('QuoteService', {
            getQuote: of(buildQuote()),
          }),
        },
        { provide: OfferService, useValue: offerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteCatalogPageComponent);
    component = fixture.componentInstance;
  });

  it('appelle l API avec quoteId au chargement', () => {
    fixture.detectChanges();

    expect(offerService.getEligibleOffers).toHaveBeenCalledWith({
      quoteId: 42,
      page: 0,
      size: 20,
      search: undefined,
      hierarchyCode: undefined,
      productTypeCode: undefined,
      bundle: null,
    });
  });

  it('affiche le compteur et les informations produit', () => {
    fixture.detectChanges();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('1 Resultat(s) trouves');
    expect(fixture.nativeElement.textContent).toContain('Jawal 20 Go');
    expect(fixture.nativeElement.textContent).toContain('JWL-20');
    expect(fixture.nativeElement.textContent).toContain('199.00 MAD');
  });

  it('le bouton Reinitialiser recharge tous les produits', () => {
    fixture.detectChanges();
    component.searchTerm = 'Jawal';
    component.selectedCategoryLabel = 'Recharge';
    component.selectedHierarchyCode = 'Recharge';

    fixture.debugElement.query(By.css('.filter-head button')).nativeElement.click();

    expect(component.searchTerm).toBe('');
    expect(component.selectedCategoryLabel).toBe('');
    expect(offerService.getEligibleOffers).toHaveBeenCalledTimes(2);
  });

  it('la recherche declenche un appel API', fakeAsync(() => {
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input[type="search"]')).nativeElement as HTMLInputElement;

    input.value = 'Jawal';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick(250);

    expect(offerService.getEligibleOffers).toHaveBeenCalledWith({
      quoteId: 42,
      page: 0,
      size: 20,
      search: 'Jawal',
      hierarchyCode: undefined,
      productTypeCode: undefined,
      bundle: null,
    });
  }));

  it('le bouton Voir le devis redirige vers /quotes/:quoteId', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture.detectChanges();
    fixture.debugElement.query(By.css('.quote-footer__actions button')).nativeElement.click();

    expect(router.navigate).toHaveBeenCalledWith(['/quotes', 42]);
  });
});

function buildQuote(): Quote {
  return {
    id: 42,
    quoteNumber: 'QUO-0042',
    customerId: 3,
    customerNameSnapshot: 'ali credit',
    customerContactSnapshot: 'alicredit@gmail.com',
    billingAccount: 'RET00000000001731',
    orderSegment: 'RETAIL',
    networkType: 'DIRECT_NETWORK',
    customerType: 'INDIVIDUAL',
    paymentType: 'UPFRONT',
    creditDuration: 'NA',
    quoteExpirationDate: '2026-06-13',
    orderStartType: 'IMMEDIATE',
    description: null,
    status: 'DRAFT',
    totalAmount: 0,
    createdAt: '2026-06-06T10:00:00',
    updatedAt: '2026-06-06T10:00:00',
    items: [],
  };
}

function buildOffer(): Offer {
  return {
    id: 1,
    code: 'JWL-20',
    existingCode: 'OLD-JWL-20',
    name: 'Jawal 20 Go',
    category: 'RECHARGE',
    description: 'Recharge mobile',
    productTypeCode: 'RECHARGE',
    productTypeDescription: 'Recharge physique',
    brand: 'Maroc Telecom',
    balance: null,
    hierarchyCode: 'Recharge',
    price: 199,
    duration: 30,
    eligibleForNormalCustomer: true,
    bundle: false,
    active: true,
  };
}

function buildPage(content: Offer[]) {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    number: 0,
    size: 20,
    first: true,
    last: true,
  };
}
