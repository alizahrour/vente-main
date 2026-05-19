import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SaleService } from '../../../core/services/sale.service';
import { InvoicePageComponent } from './invoice-page.component';

describe('InvoicePageComponent', () => {
  let fixture: ComponentFixture<InvoicePageComponent>;
  let component: InvoicePageComponent;
  let saleService: jasmine.SpyObj<SaleService>;

  beforeEach(async () => {
    saleService = jasmine.createSpyObj<SaleService>('SaleService', ['createInvoice']);
    saleService.createInvoice.and.returnValue(of({
      invoiceNumber: 'INV-001',
      saleId: 7,
      saleNumber: 'SALE-007',
      generatedAt: '2026-05-14T10:30:00',
      customerName: 'Sara Bennani',
      customerCin: 'CIN123',
      customerPhone: '0600000000',
      customerEmail: null,
      customerAddress: null,
      customerCity: 'Casablanca',
      agentName: 'Agent Telecom',
      agentUsername: 'agent',
      totalAmount: 250,
      method: 'CARD',
      paymentReference: 'PAY-001',
      items: [],
    }));

    await TestBed.configureTestingModule({
      declarations: [InvoicePageComponent],
      providers: [
        { provide: SaleService, useValue: saleService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } },
      ],
    })
      .overrideComponent(InvoicePageComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(InvoicePageComponent);
    component = fixture.componentInstance;
  });

  it('charge la facture de la vente payee', () => {
    fixture.detectChanges();

    expect(saleService.createInvoice).toHaveBeenCalledWith(7);
    expect(component.invoice?.invoiceNumber).toBe('INV-001');
    expect(component.loading).toBeFalse();
  });
});
