import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomersPageComponent } from './customers-page.component';

describe('CustomersPageComponent', () => {
  let fixture: ComponentFixture<CustomersPageComponent>;
  let component: CustomersPageComponent;
  let customerService: jasmine.SpyObj<CustomerService>;

  beforeEach(async () => {
    customerService = jasmine.createSpyObj<CustomerService>('CustomerService', [
      'getCustomers',
      'searchCustomers',
      'deleteCustomer',
    ]);
    customerService.getCustomers.and.returnValue(of([
      {
        id: 1,
        firstName: 'Sara',
        lastName: 'Bennani',
        fullName: 'Sara Bennani',
        cin: 'CIN123',
        phone: '0600000000',
        email: null,
        address: null,
        city: 'Casablanca',
      },
    ]));

    await TestBed.configureTestingModule({
      declarations: [CustomersPageComponent],
      providers: [{ provide: CustomerService, useValue: customerService }],
    })
      .overrideComponent(CustomersPageComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(CustomersPageComponent);
    component = fixture.componentInstance;
  });

  it('la liste clients appelle CustomerService', () => {
    fixture.detectChanges();

    expect(customerService.getCustomers).toHaveBeenCalled();
    expect(component.customers.length).toBe(1);
    expect(component.loading).toBeFalse();
  });
});
