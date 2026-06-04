import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CUSTOMER_SEARCH_CITIES, CUSTOMER_SEARCH_FIELDS } from '../data/customer-search.constants';
import { CustomerSearchFormComponent } from './customer-search-form.component';

describe('CustomerSearchFormComponent', () => {
  let fixture: ComponentFixture<CustomerSearchFormComponent>;
  let component: CustomerSearchFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerSearchFormComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerSearchFormComponent);
    component = fixture.componentInstance;
    component.fields = CUSTOMER_SEARCH_FIELDS;
    component.cityOptions = CUSTOMER_SEARCH_CITIES;
    component.form = new FormBuilder().nonNullable.group({
      callNumber: [''],
      publicKey: [''],
      lastName: [''],
      ccu: [''],
      idNumber: [''],
      clientCode: [''],
      firstName: [''],
      contractCode: [''],
      simCard: [''],
      city: [''],
      ice: [''],
      email: [''],
    });
  });

  it('affiche les 12 criteres et le titre initial', () => {
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('h2')).nativeElement.textContent).toContain('Rechercher des fiches client');
    expect(fixture.debugElement.queryAll(By.css('.search-form-grid input')).length).toBe(12);
  });

  it('affiche le titre de modification', () => {
    component.isEditMode = true;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('h2')).nativeElement.textContent).toContain('Modifier vos critères de recherche');
  });

  it('desactive le bouton principal pendant le chargement', () => {
    component.loading = true;
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(submitButton.disabled).toBeTrue();
    expect(submitButton.textContent).toContain('Recherche...');
  });

  it('affiche le message de validation et emet les actions', () => {
    spyOn(component.submitted, 'emit');
    spyOn(component.refreshed, 'emit');
    component.validationMessage = 'Saisissez au moins un critere de recherche.';
    fixture.detectChanges();

    fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit');
    fixture.debugElement.queryAll(By.css('button'))[1].nativeElement.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Saisissez au moins un critere de recherche.');
    expect(component.submitted.emit).toHaveBeenCalled();
    expect(component.refreshed.emit).toHaveBeenCalled();
  });
});
