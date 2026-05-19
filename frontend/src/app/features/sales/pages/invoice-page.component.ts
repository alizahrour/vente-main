import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Invoice } from '../../../core/models/sale.models';
import { SaleService } from '../../../core/services/sale.service';

@Component({
  selector: 'app-invoice-page',
  standalone: false,
  templateUrl: './invoice-page.component.html',
  styleUrl: './invoice-page.component.scss',
})
export class InvoicePageComponent implements OnInit {
  invoice: Invoice | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly saleService: SaleService
  ) {}

  ngOnInit(): void {
    const saleId = Number(this.route.snapshot.paramMap.get('id'));
    this.saleService.createInvoice(saleId).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Generation de la facture impossible.';
        this.loading = false;
      },
    });
  }

  print(): void {
    window.print();
  }
}
