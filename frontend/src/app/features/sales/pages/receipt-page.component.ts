import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Invoice } from '../../../core/models/sale.models';
import { SaleService } from '../../../core/services/sale.service';

@Component({
  selector: 'app-receipt-page',
  standalone: false,
  templateUrl: './receipt-page.component.html',
  styleUrl: './receipt-page.component.scss',
})
export class ReceiptPageComponent implements OnInit {
  invoice: Invoice | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly saleService: SaleService
  ) {}

  ngOnInit(): void {
    const saleId = Number(this.route.snapshot.paramMap.get('id'));
    this.saleService.getInvoice(saleId).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Chargement de la facture impossible.';
        this.loading = false;
      },
    });
  }

  print(): void {
    window.print();
  }
}
