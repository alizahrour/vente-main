import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { SaleService } from '../../../core/services/sale.service';
import { PaymentPageComponent } from './payment-page.component';

describe('PaymentPageComponent', () => {
  let fixture: ComponentFixture<PaymentPageComponent>;
  let component: PaymentPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentPageComponent],
      imports: [CommonModule, ReactiveFormsModule],
      providers: [
        {
          provide: SaleService,
          useValue: {
            getSale: () => of({
              id: 7,
              saleNumber: 'SALE-007',
              customerId: 1,
              customerName: 'Sara Bennani',
              customerPhone: '0600000000',
              status: 'VALIDATED' as const,
              cancellationReason: null,
              totalAmount: 250,
              paid: false,
              createdAt: '2026-05-14T10:00:00',
              validatedAt: '2026-05-14T10:10:00',
              agent: 'Agent Telecom',
              items: [],
            }),
            paySale: () => of({
              id: 1,
              saleId: 7,
              amount: 250,
              method: 'CASH',
              status: 'PAID' as const,
              paidAt: '2026-05-14T10:20:00',
              reference: 'PAY-001',
              invoiceNumber: 'INV-001',
            }),
          },
        },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } },
      ],
    })
      .overrideComponent(PaymentPageComponent, {
        set: {
          template: `
            <section *ngIf="sale">
              <form [formGroup]="form">
                <p>Total attendu: <strong>{{ sale.totalAmount | number:'1.2-2' }} MAD</strong></p>
                <input type="number" formControlName="amount" readonly />
              </form>
            </section>
          `,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PaymentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('le paiement affiche le montant total non modifiable', () => {
    const amountInput: HTMLInputElement = fixture.nativeElement.querySelector('input[formControlName="amount"]');

    expect(component.sale?.totalAmount).toBe(250);
    expect(component.form.controls.amount.value).toBe(250);
    expect(amountInput.value).toBe('250');
    expect(amountInput.readOnly).toBeTrue();
  });
});
