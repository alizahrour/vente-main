import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CUSTOMER_SEARCH_SUMMARY_ITEMS } from '../data/customer-search.constants';
import { CustomerSearchCriteria, CustomerSearchResult } from '../models/customer-search.models';
import { CustomerSearchService } from '../services/customer-search.service';
import { CustomersPageComponent } from './customers-page.component';

describe('CustomersPageComponent', () => {
  let fixture: ComponentFixture<CustomersPageComponent>;
  let component: CustomersPageComponent;
  let customerSearchService: jasmine.SpyObj<CustomerSearchService>;

  beforeEach(async () => {
    customerSearchService = jasmine.createSpyObj<CustomerSearchService>('CustomerSearchService', ['search']);
    customerSearchService.search.and.returnValue(of(buildSearchResult()));

    await TestBed.configureTestingModule({
      declarations: [CustomersPageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: { hasRole: () => true } },
        { provide: CustomerSearchService, useValue: customerSearchService },
      ],
    })
      .overrideComponent(CustomersPageComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(CustomersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initialise la page en etat vide', () => {
    expect(component.hasSearched).toBeFalse();
    expect(component.isEditingCriteria).toBeFalse();
    expect(component.loading).toBeFalse();
    expect(component.filledCriteriaCount).toBe(0);
    expect(component.paginatedRecords.length).toBe(0);
  });

  it('empeche la recherche si tous les champs sont vides', () => {
    component.search();

    expect(customerSearchService.search).not.toHaveBeenCalled();
    expect(component.validationMessage).toBe('Saisissez au moins un critere de recherche.');
  });

  it('recherche par N client et passe en mode resultats', fakeAsync(() => {
    component.searchForm.patchValue({ clientCode: '1.10000001' });

    component.search();
    tick();

    expect(customerSearchService.search).toHaveBeenCalledWith(buildCriteria({ clientCode: '1.10000001' }));
    expect(component.hasSearched).toBeTrue();
    expect(component.isEditingCriteria).toBeFalse();
    expect(component.hasAnyResults).toBeTrue();
    expect(component.activeCategory).toBe('individual');
    expect(component.pageStart).toBe(1);
    expect(component.pageEnd).toBe(5);
    expect(component.paginatedRecords.length).toBe(5);
  }));

  it('conserve les valeurs et expose un resume actif des criteres', () => {
    component.searchForm.patchValue({ clientCode: '1.10000001' });

    const activeSummaryItems = component.summaryItems.filter((item) => item.type === 'field' && item.active);

    expect(activeSummaryItems.length).toBe(1);
    expect(activeSummaryItems[0].name).toBe('clientCode');
    expect(activeSummaryItems[0].value).toBe('1.10000001');
    expect(component.summaryItems.length).toBe(CUSTOMER_SEARCH_SUMMARY_ITEMS.length);
  });

  it('ouvre puis ferme le mode edition des criteres', () => {
    component.openCriteriaEditor();
    expect(component.isEditingCriteria).toBeTrue();

    component.closeCriteriaEditor();
    expect(component.isEditingCriteria).toBeFalse();
  });

  it('rafraichit la recherche et revient a letat initial', fakeAsync(() => {
    component.searchForm.patchValue({ clientCode: '1.10000001' });
    component.search();
    tick();

    component.refresh();

    expect(component.searchForm.getRawValue()).toEqual(buildCriteria());
    expect(component.hasSearched).toBeFalse();
    expect(component.hasAnyResults).toBeFalse();
    expect(component.errorMessage).toBe('');
    expect(component.validationMessage).toBe('');
  }));

  it('met a jour les compteurs et change donglet', fakeAsync(() => {
    component.searchForm.patchValue({ clientCode: '1.10000001' });
    component.search();
    tick();

    expect(component.tabs.find((tab) => tab.key === 'individual')?.count).toBe(6);
    expect(component.tabs.find((tab) => tab.key === 'corporate')?.count).toBe(1);

    component.selectCategory('corporate');

    expect(component.activeCategory).toBe('corporate');
    expect(component.activeRecordsCount).toBe(1);
    expect(component.pageStart).toBe(1);
    expect(component.pageEnd).toBe(1);
  }));

  it('pagine les resultats de longlet actif', fakeAsync(() => {
    component.searchForm.patchValue({ clientCode: '1.10000001' });
    component.search();
    tick();

    component.nextPage();
    expect(component.pageStart).toBe(6);
    expect(component.pageEnd).toBe(6);
    expect(component.paginatedRecords.length).toBe(1);

    component.previousPage();
    expect(component.pageStart).toBe(1);
    expect(component.pageEnd).toBe(5);
  }));

  it('gere letat aucun resultat', fakeAsync(() => {
    customerSearchService.search.and.returnValue(of({
      individuals: [],
      corporates: [],
      dealers: [],
      legacy: [],
    }));
    component.searchForm.patchValue({ clientCode: 'NOPE' });

    component.search();
    tick();

    expect(component.hasSearched).toBeTrue();
    expect(component.hasAnyResults).toBeFalse();
    expect(component.activeRecordsCount).toBe(0);
  }));

  it('gere letat derreur', fakeAsync(() => {
    customerSearchService.search.and.returnValue(throwError(() => new Error('Erreur de recherche simulee')));
    component.searchForm.patchValue({ clientCode: 'ERR' });

    component.search();
    tick();

    expect(component.errorMessage).toBe('Erreur de recherche simulee');
    expect(component.hasSearched).toBeTrue();
    expect(component.hasAnyResults).toBeFalse();
  }));
});

function buildCriteria(overrides: Partial<CustomerSearchCriteria> = {}): CustomerSearchCriteria {
  return {
    callNumber: '',
    publicKey: '',
    lastName: '',
    ccu: '',
    idNumber: '',
    clientCode: '',
    firstName: '',
    contractCode: '',
    simCard: '',
    city: '',
    ice: '',
    email: '',
    ...overrides,
  };
}

function buildSearchResult(): CustomerSearchResult {
  return {
    individuals: [
      buildRecord(1, 'Alpha Benali', 'individual', 4, '1.10000001'),
      buildRecord(2, 'Bravo Saidi', 'individual', 1, '1.10000002'),
      buildRecord(3, 'Charlie Rami', 'individual', 1, '1.10000003'),
      buildRecord(4, 'Delta Sefrioui', 'individual', 1, '1.10000004'),
      buildRecord(5, 'Echo Amrani', 'individual', 1, '1.10000005'),
      buildRecord(6, 'Foxtrot Idrissi', 'individual', 1, '1.10000006'),
    ],
    corporates: [buildRecord(101, 'Atlas Entreprises', 'corporate', 3, '9.40011220001')],
    dealers: [buildRecord(201, 'Reseau Sud Distribution', 'dealer', 2, '8.50022110009')],
    legacy: [buildRecord(301, 'Centre Archive', 'legacy', 1, '7.30099887766')],
  };
}

function buildRecord(
  id: number,
  displayName: string,
  category: 'individual' | 'corporate' | 'dealer' | 'legacy',
  contractCount: number,
  customerNumber: string
) {
  return {
    id,
    category,
    displayName,
    customerNumber,
    identityType: category === 'corporate' ? 'RC' : 'CIN',
    identityNumber: `ID-${id}`,
    segment: category === 'corporate' ? 'Grands Comptes' : 'Residentiel',
    customerClass: category === 'dealer' ? 'Revendeur' : category === 'legacy' ? 'Legacy' : 'Residentiel',
    addressLines: ['10, Avenue de Test', 'Rabat 10000'],
    contracts: Array.from({ length: contractCount }, (_, index) => ({
      contractNumber: `CONTR-${id}-${index + 1}`,
      activationDate: `0${Math.min(index + 1, 9)}/05/2026`,
      imsi: `90900${id}${index + 1}`,
      nd: `0600000${id}${index + 1}`,
      offer: `OFFRE ${index + 1}`,
    })),
  };
}
