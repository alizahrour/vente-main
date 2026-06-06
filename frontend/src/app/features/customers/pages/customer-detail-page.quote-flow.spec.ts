import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { delay, of } from 'rxjs';
import { Quote } from '../../../core/models/quote.models';
import { QuoteService } from '../../../core/services/quote.service';
import { CustomerService } from '../../../core/services/customer.service';
import { SharedModule } from '../../../shared/shared.module';
import { CreateQuoteDetailsComponent } from '../components/create-quote-details.component';
import { CustomerDetailPageComponent } from './customer-detail-page.component';

describe('CustomerDetailPageComponent Quote Flow', () => {
  describe('template integration', () => {
    let fixture: ComponentFixture<CustomerDetailPageComponent>;
    let component: CustomerDetailPageComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [CustomerDetailPageComponent, CreateQuoteDetailsComponent],
        imports: [SharedModule, RouterTestingModule],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: convertToParamMap({ id: '3' }),
              },
            },
          },
          {
            provide: CustomerService,
            useValue: jasmine.createSpyObj<CustomerService>('CustomerService', {
              getCustomer: of(buildCustomer()),
            }),
          },
          {
            provide: QuoteService,
            useValue: jasmine.createSpyObj<QuoteService>('QuoteService', ['createQuote']),
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(CustomerDetailPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('ouvre la modale CreateQuoteDetails apres clic sur Nouveau panier', () => {
      const basketButton = fixture.debugElement.queryAll(By.css('.detail-actions button'))[0];

      basketButton.nativeElement.click();
      fixture.detectChanges();

      expect(component.quoteDialogOpen).toBeTrue();
      expect(fixture.debugElement.query(By.directive(CreateQuoteDetailsComponent))).not.toBeNull();
    });

    it('ferme la modale apres clic sur Annuler', () => {
      const basketButton = fixture.debugElement.queryAll(By.css('.detail-actions button'))[0];

      basketButton.nativeElement.click();
      fixture.detectChanges();

      fixture.debugElement.query(By.css('.quote-dialog__actions .ghost')).nativeElement.click();
      fixture.detectChanges();

      expect(component.quoteDialogOpen).toBeFalse();
    });
  });

  describe('service and navigation', () => {
    let fixture: ComponentFixture<CustomerDetailPageComponent>;
    let component: CustomerDetailPageComponent;
    let quoteService: jasmine.SpyObj<QuoteService>;
    let router: Router;

    beforeEach(async () => {
      quoteService = jasmine.createSpyObj<QuoteService>('QuoteService', ['createQuote']);

      await TestBed.configureTestingModule({
        declarations: [CustomerDetailPageComponent],
        imports: [RouterTestingModule],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: convertToParamMap({ id: '3' }),
              },
            },
          },
          {
            provide: CustomerService,
            useValue: jasmine.createSpyObj<CustomerService>('CustomerService', {
              getCustomer: of(buildCustomer()),
            }),
          },
          { provide: QuoteService, useValue: quoteService },
        ],
      })
        .overrideComponent(CustomerDetailPageComponent, { set: { template: '' } })
        .compileComponents();

      fixture = TestBed.createComponent(CustomerDetailPageComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('appelle quoteService et redirige vers le catalogue apres Continuer', fakeAsync(() => {
      const quote: Quote = {
        id: 42,
        quoteNumber: 'QUO-0042',
        customerId: 3,
        customerNameSnapshot: 'Ali Credit',
        customerContactSnapshot: 'alicredit@gmail.com',
        billingAccount: 'RET00000000001731',
        orderSegment: 'RETAIL',
        networkType: 'DIRECT_NETWORK',
        customerType: 'INDIVIDUAL',
        paymentType: 'UPFRONT',
        creditDuration: 'NA',
        quoteExpirationDate: '2026-06-12',
        orderStartType: 'IMMEDIATE',
        description: 'Description du devis',
        status: 'DRAFT',
        totalAmount: 0,
        createdAt: '2026-06-05T18:00:00',
        updatedAt: '2026-06-05T18:00:00',
        items: [],
      };

      quoteService.createQuote.and.returnValue(of(quote).pipe(delay(0)));

      component.createQuote({
        customerId: 3,
        customerContact: 'alicredit@gmail.com',
        billingAccount: 'RET00000000001731',
        orderSegment: 'RETAIL',
        networkType: 'DIRECT_NETWORK',
        creditDuration: 'NA',
        quoteExpirationDate: '2026-06-12',
        orderStartType: 'IMMEDIATE',
        description: 'Description du devis',
      });

      tick(0);

      expect(quoteService.createQuote).toHaveBeenCalledWith({
        customerId: 3,
        customerContact: 'alicredit@gmail.com',
        billingAccount: 'RET00000000001731',
        orderSegment: 'RETAIL',
        networkType: 'DIRECT_NETWORK',
        creditDuration: 'NA',
        quoteExpirationDate: '2026-06-12',
        orderStartType: 'IMMEDIATE',
        description: 'Description du devis',
      });
      expect(router.navigate).toHaveBeenCalledWith(['/quotes', 42, 'catalog']);
    }));
  });
});

function buildCustomer() {
  return {
    id: 3,
    firstName: 'Ali',
    lastName: 'Credit',
    fullName: 'Ali Credit',
    cin: 'AZ7489',
    phone: '0667001122',
    email: null,
    address: 'AZAHRAE',
    city: 'SALE LAYAYDA',
    profile: {
      status: 'Actif',
      customerNumber: '1.56792161235',
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
      invoices: [{ reference: 'RET00000000001731', amount: 100, remaining: 0 }],
      interactions: [],
    },
  };
}
