import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Invoice, PaymentPayload, PaymentResponse, Sale } from '../../../core/models/sale.models';
import { SaleService } from '../../../core/services/sale.service';

@Component({
  selector: 'app-payment-page',
  standalone: false,
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss',
})
export class PaymentPageComponent implements OnInit {
  sale: Sale | null = null;
  payment: PaymentResponse | null = null;
  invoice: Invoice | null = null;
  errorMessage = '';
  successDialogOpen = false;
  savingPayment = false;
  submittingInvoice = false;

  readonly methods: { value: PaymentPayload['method']; label: string }[] = [
    { value: 'CASH', label: 'Espece' },
    { value: 'CHECK', label: 'Cheque' },
    { value: 'TRANSFER', label: 'Virement bancaire' },
    { value: 'CARD', label: 'TPE' },
  ];
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly saleService: SaleService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.nonNullable.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      method: ['CASH' as PaymentPayload['method'], Validators.required],
      stampDuty: [true],
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.saleService.getSale(id).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.form.patchValue({ amount: sale.totalAmount });
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Vente introuvable.';
        this.cdr.detectChanges();
      },
    });
  }

  get taxAmount(): number {
    return (this.sale?.totalAmount ?? 0) * 0.2;
  }

  get amountWithoutTax(): number {
    return (this.sale?.totalAmount ?? 0) - this.taxAmount;
  }

  pay(): void {
    if (!this.sale || this.form.invalid || this.payment) return;
    const { amount, method } = this.form.getRawValue();
    this.savingPayment = true;
    this.errorMessage = '';

    this.saleService.paySale(this.sale.id, { amount, method }).subscribe({
      next: (payment) => {
        this.payment = payment;
        this.form.patchValue({ amount: 0 });
        this.savingPayment = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Paiement impossible.';
        this.savingPayment = false;
        this.cdr.detectChanges();
      },
    });
  }

  submitInvoice(): void {
    if (!this.sale || !this.payment) return;
    this.submittingInvoice = true;
    this.errorMessage = '';

    this.saleService.createInvoice(this.sale.id).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.successDialogOpen = true;
        this.submittingInvoice = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Generation de facture impossible.';
        this.submittingInvoice = false;
        this.cdr.detectChanges();
      },
    });
  }

  closeSuccess(): void {
    this.successDialogOpen = false;
    this.router.navigate(['/sales/history']);
  }
}
