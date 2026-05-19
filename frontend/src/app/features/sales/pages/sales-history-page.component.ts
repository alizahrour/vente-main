import { Component, OnInit } from '@angular/core';
import { Sale } from '../../../core/models/sale.models';
import { SaleService } from '../../../core/services/sale.service';

@Component({
  selector: 'app-sales-history-page',
  standalone: false,
  templateUrl: './sales-history-page.component.html',
  styleUrl: './sales-history-page.component.scss',
})
export class SalesHistoryPageComponent implements OnInit {
  sales: Sale[] = [];
  loading = true;
  errorMessage = '';

  constructor(private readonly saleService: SaleService) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading = true;
    this.errorMessage = '';

    this.saleService.getSales().subscribe({
      next: (sales) => {
        this.sales = sales;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Chargement de l’historique impossible.';
        this.loading = false;
      },
    });
  }
}
