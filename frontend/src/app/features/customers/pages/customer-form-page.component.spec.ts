import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerFormPageComponent } from './customer-form-page.component';

describe('CustomerFormPageComponent', () => {
  let fixture: ComponentFixture<CustomerFormPageComponent>;
  let component: CustomerFormPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerFormPageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: CustomerService, useValue: jasmine.createSpyObj<CustomerService>('CustomerService', ['getCustomer', 'createCustomer', 'updateCustomer']) },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      ],
    })
      .overrideComponent(CustomerFormPageComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerFormPageComponent);
    component = fixture.componentInstance;
  });

  it('le formulaire client valide les champs obligatoires', () => {
    component.form.setValue({
      firstName: '',
      lastName: '',
      cin: '',
      phone: '',
      email: '',
      address: '',
      city: '',
    });

    expect(component.form.invalid).toBeTrue();
    expect(component.form.controls.firstName.hasError('required')).toBeTrue();
    expect(component.form.controls.lastName.hasError('required')).toBeTrue();
    expect(component.form.controls.cin.hasError('required')).toBeTrue();
    expect(component.form.controls.phone.hasError('required')).toBeTrue();
  });
});
