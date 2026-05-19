import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { OfferService } from '../../../core/services/offer.service';
import { SaleService } from '../../../core/services/sale.service';
import { SaleDetailPageComponent } from './sale-detail-page.component';

describe('SaleDetailPageComponent', () => {
  let fixture: ComponentFixture<SaleDetailPageComponent>;
  let component: SaleDetailPageComponent;
  let saleService: jasmine.SpyObj<SaleService>;

  beforeEach(async () => {
    saleService = jasmine.createSpyObj<SaleService>('SaleService', [
      'getSale',
      'addItem',
      'deleteItem',
      'validateSale',
      'cancelSale',
    ]);
    saleService.getSale.and.returnValue(of(sale()));
    saleService.addItem.and.returnValue(of({
      ...sale(),
      items: [{ id: 1, offerId: 10, offerCode: 'MOB-10', offerName: 'Mobile 10Go', unitPrice: 99, quantity: 1, totalPrice: 99 }],
      totalAmount: 99,
    }));

    await TestBed.configureTestingModule({
      declarations: [SaleDetailPageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: SaleService, useValue: saleService },
        { provide: OfferService, useValue: { getActiveOffers: () => of([]) } },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } },
      ],
    })
      .overrideComponent(SaleDetailPageComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(SaleDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("l'ajout d'une offre au panier appelle SaleService", () => {
    component.itemForm.setValue({ offerId: 10, quantity: 1 });

    component.addItem();

    expect(saleService.addItem).toHaveBeenCalledWith(7, { offerId: 10, quantity: 1 });
    expect(component.sale?.totalAmount).toBe(99);
  });

  function sale() {
    return {
      id: 7,
      saleNumber: 'SALE-007',
      customerId: 1,
      customerName: 'Sara Bennani',
      customerPhone: '0600000000',
      status: 'DRAFT' as const,
      cancellationReason: null,
      totalAmount: 0,
      paid: false,
      createdAt: '2026-05-14T10:00:00',
      validatedAt: null,
      agent: 'Agent Telecom',
      items: [],
    };
  }
});
