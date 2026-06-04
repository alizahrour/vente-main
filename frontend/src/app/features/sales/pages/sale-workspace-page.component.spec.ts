import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';
import { SaleService } from '../../../core/services/sale.service';
import { SaleWorkspacePageComponent } from './sale-workspace-page.component';

describe('SaleWorkspacePageComponent', () => {
  let fixture: ComponentFixture<SaleWorkspacePageComponent>;
  let component: SaleWorkspacePageComponent;
  let saleService: jasmine.SpyObj<SaleService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    saleService = jasmine.createSpyObj<SaleService>('SaleService', ['createSale']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [SaleWorkspacePageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: CustomerService,
          useValue: { getCustomers: () => of([]) },
        },
        {
          provide: SaleService,
          useValue: saleService,
        },
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: AuthService,
          useValue: { hasRole: () => false },
        },
      ],
    })
      .overrideComponent(SaleWorkspacePageComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(SaleWorkspacePageComponent);
    component = fixture.componentInstance;
  });

  it('cree une vente DRAFT via SaleService', () => {
    saleService.createSale.and.returnValue(of({
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
    }));
    component.selectedCustomer = {
      id: 1,
      firstName: 'Sara',
      lastName: 'Bennani',
      fullName: 'Sara Bennani',
      cin: 'CIN123',
      phone: '0600000000',
      email: null,
      address: null,
      city: 'Casablanca',
    };

    component.createSale();

    expect(saleService.createSale).toHaveBeenCalledWith({ customerId: 1, items: [] });
    expect(router.navigate).toHaveBeenCalledWith(['/sales', 7]);
  });
});
