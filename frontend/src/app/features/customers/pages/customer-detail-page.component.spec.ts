import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { QuoteService } from '../../../core/services/quote.service';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerDetailPageComponent } from './customer-detail-page.component';

describe('CustomerDetailPageComponent', () => {
  let fixture: ComponentFixture<CustomerDetailPageComponent>;
  let component: CustomerDetailPageComponent;
  let customerService: jasmine.SpyObj<CustomerService>;

  beforeEach(async () => {
    customerService = jasmine.createSpyObj<CustomerService>('CustomerService', ['getCustomer']);

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
        { provide: CustomerService, useValue: customerService },
        { provide: QuoteService, useValue: jasmine.createSpyObj<QuoteService>('QuoteService', ['createQuote']) },
      ],
    })
      .overrideComponent(CustomerDetailPageComponent, { set: { template: '' } })
      .compileComponents();
  });

  it('charge la fiche client et quitte letat de chargement', fakeAsync(() => {
    customerService.getCustomer.and.returnValue(of(buildCustomer()));

    fixture = TestBed.createComponent(CustomerDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    flushMicrotasks();

    expect(customerService.getCustomer).toHaveBeenCalledWith(3);
    expect(component.customer?.id).toBe(3);
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('');
  }));

  it('gere une erreur de chargement', fakeAsync(() => {
    customerService.getCustomer.and.returnValue(throwError(() => new Error('Chargement impossible')));

    fixture = TestBed.createComponent(CustomerDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    flushMicrotasks();

    expect(component.customer).toBeNull();
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Chargement impossible');
  }));
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
  };
}
