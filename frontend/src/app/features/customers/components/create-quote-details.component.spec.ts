import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SharedModule } from '../../../shared/shared.module';
import { CreateQuoteDetailsComponent } from './create-quote-details.component';

describe('CreateQuoteDetailsComponent', () => {
  let fixture: ComponentFixture<CreateQuoteDetailsComponent>;
  let component: CreateQuoteDetailsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateQuoteDetailsComponent],
      imports: [SharedModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateQuoteDetailsComponent);
    component = fixture.componentInstance;
    component.customer = {
      id: 3,
      firstName: 'Ali',
      lastName: 'Credit',
      fullName: 'Ali Credit',
      cin: 'AZ7489',
      phone: '0667001122',
      email: 'alicredit@gmail.com',
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
        invoices: [
          { reference: 'RET00000000001731', amount: 100, remaining: 0 },
          { reference: 'RET00000000001704', amount: 6405, remaining: 6405 },
        ],
        interactions: [],
      },
    };
    fixture.detectChanges();
  });

  it('pre-remplit les champs client et contact', () => {
    const inputs = fixture.debugElement.queryAll(By.css('input'));
    const selects = fixture.debugElement.queryAll(By.css('select'));

    expect(inputs[0].nativeElement.value).toBe('Ali Credit');
    expect(selects[0].nativeElement.value).toBe('alicredit@gmail.com');
    expect(selects[1].nativeElement.value).toBe('RETAIL');
    expect(selects[2].nativeElement.value).toBe('RET00000000001731');
  });

  it('propose N/A, 12 Mois, 18 Mois et 24 Mois pour la duree du credit', () => {
    const options = fixture.debugElement.queryAll(By.css('select[formcontrolname="creditDuration"] option'));
    const labels = options.map((option) => option.nativeElement.textContent.trim());

    expect(labels).toEqual(['N/A', '12 Mois', '18 Mois', '24 Mois']);
  });

  it('emet un payload quote details au clic sur Continuer', () => {
    spyOn(component.continueRequested, 'emit');

    fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement.click();

    expect(component.continueRequested.emit).toHaveBeenCalledWith({
      customerId: 3,
      customerContact: 'alicredit@gmail.com',
      billingAccount: 'RET00000000001731',
      orderSegment: 'RETAIL',
      networkType: 'DIRECT_NETWORK',
      creditDuration: 'NA',
      quoteExpirationDate: component.quoteForm.controls.quoteExpirationDate.value,
      orderStartType: 'IMMEDIATE',
      description: '',
    });
  });

  it('emet cancelRequested au clic sur Annuler', () => {
    spyOn(component.cancelRequested, 'emit');

    fixture.debugElement.query(By.css('.quote-dialog__actions .ghost')).nativeElement.click();

    expect(component.cancelRequested.emit).toHaveBeenCalled();
  });
});
