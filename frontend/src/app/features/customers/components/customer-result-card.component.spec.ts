import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterLinkWithHref } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CustomerResultCardComponent } from './customer-result-card.component';

describe('CustomerResultCardComponent', () => {
  let fixture: ComponentFixture<CustomerResultCardComponent>;
  let component: CustomerResultCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerResultCardComponent],
      imports: [RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerResultCardComponent);
    component = fixture.componentInstance;
    component.record = {
      id: 1,
      category: 'individual',
      displayName: 'Alpha Benali',
      customerNumber: '1.10000001',
      identityType: 'CIN',
      identityNumber: 'ID-1',
      segment: 'Residentiel',
      customerClass: 'Residentiel',
      addressLines: ['10, Avenue de Test', 'Rabat 10000'],
      contracts: [
        { contractNumber: 'CONTR-1', activationDate: '01/05/2026', imsi: 'IMSI-1', nd: '0600000001', offer: 'OFFRE 1' },
        { contractNumber: 'CONTR-2', activationDate: '02/05/2026', imsi: 'IMSI-2', nd: '0600000002', offer: 'OFFRE 2' },
        { contractNumber: 'CONTR-3', activationDate: '03/05/2026', imsi: 'IMSI-3', nd: '0600000003', offer: 'OFFRE 3' },
        { contractNumber: 'CONTR-4', activationDate: '04/05/2026', imsi: 'IMSI-4', nd: '0600000004', offer: 'OFFRE 4' },
      ],
    };
    fixture.detectChanges();
  });

  it('affiche deux contrats maximum et le resume des contrats restants', () => {
    expect(fixture.debugElement.queryAll(By.css('.result-card__contract')).length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('+2 Contrats');
  });

  it('rend la carte cliquable vers la fiche client', () => {
    const cardLink = fixture.debugElement.query(By.css('.result-card')).nativeElement as HTMLAnchorElement;
    const routerLink = fixture.debugElement.query(By.directive(RouterLinkWithHref)).injector.get(RouterLinkWithHref);

    expect(routerLink.href).toBe('/customers/1');
    expect(cardLink.getAttribute('aria-label')).toContain('Alpha Benali');
  });
});
