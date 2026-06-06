import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { OfferService } from '../../../core/services/offer.service';
import { OffersPageComponent } from './offers-page.component';

describe('OffersPageComponent', () => {
  let fixture: ComponentFixture<OffersPageComponent>;
  let component: OffersPageComponent;
  let offerService: jasmine.SpyObj<OfferService>;

  beforeEach(async () => {
    offerService = jasmine.createSpyObj<OfferService>('OfferService', ['getOffers', 'activateOffer', 'deactivateOffer']);
    offerService.getOffers.and.returnValue(of([
      {
        id: 1,
        code: 'MOB-10',
        existingCode: 'MOB-10',
        name: 'Mobile 10Go',
        category: 'MOBILE' as const,
        description: 'Forfait mobile',
        productTypeCode: 'MOBILE',
        productTypeDescription: 'Forfait mobile',
        brand: 'Maroc Telecom',
        balance: null,
        hierarchyCode: 'MOBILE',
        price: 99,
        duration: 30,
        eligibleForNormalCustomer: true,
        bundle: false,
        active: true,
      },
    ]));

    await TestBed.configureTestingModule({
      declarations: [OffersPageComponent],
      providers: [
        { provide: OfferService, useValue: offerService },
        { provide: AuthService, useValue: { isAdmin: () => false } },
      ],
    })
      .overrideComponent(OffersPageComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(OffersPageComponent);
    component = fixture.componentInstance;
  });

  it('le catalogue affiche les offres actives', () => {
    fixture.detectChanges();

    expect(offerService.getOffers).toHaveBeenCalled();
    expect(component.offers.length).toBe(1);
    expect(component.offers[0].active).toBeTrue();
    expect(component.loading).toBeFalse();
  });
});
