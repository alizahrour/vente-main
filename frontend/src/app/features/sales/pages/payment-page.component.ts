import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentPayload, Sale } from '../../../core/models/sale.models';
import { SaleService } from '../../../core/services/sale.service';

@Component({
  selector: 'app-payment-page',
  standalone: false,
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss',
})
export class PaymentPageComponent implements OnInit {
  sale: Sale | null = null;
  errorMessage = '';
  methods: PaymentPayload['method'][] = ['CASH', 'CARD', 'TRANSFER', 'CHECK'];

  readonly form = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    method: ['CASH' as PaymentPayload['method'], Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly saleService: SaleService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.saleService.getSale(id).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.form.patchValue({ amount: sale.totalAmount });
      },
      error: (error) => this.errorMessage = error.error?.message ?? 'Vente introuvable.',
    });
  }

  pay(): void {
    if (!this.sale || this.form.invalid) return;
    this.saleService.paySale(this.sale.id, this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/sales', this.sale!.id, 'invoice']),
      error: (error) => this.errorMessage = error.error?.message ?? 'Paiement impossible.',
    });
  }
}
