import { Component, OnInit } from '@angular/core';
import { Customer } from '../../../core/models/customer.models';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-customers-page',
  standalone: false,
  templateUrl: './customers-page.component.html',
  styleUrl: './customers-page.component.scss',
})
export class CustomersPageComponent implements OnInit {
  customers: Customer[] = [];
  keyword = '';
  loading = true;
  errorMessage = '';

  constructor(private readonly customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Chargement des clients impossible.';
        this.loading = false;
      },
    });
  }

  search(): void {
    const keyword = this.keyword.trim();
    if (!keyword) {
      this.loadCustomers();
      return;
    }

    this.customerService.searchCustomers(keyword).subscribe({
      next: (customers) => this.customers = customers,
      error: (error) => this.errorMessage = error.error?.message ?? 'Recherche impossible.',
    });
  }

  deleteCustomer(customer: Customer): void {
    this.customerService.deleteCustomer(customer.id).subscribe({
      next: () => this.loadCustomers(),
      error: (error) => this.errorMessage = error.error?.message ?? 'Suppression impossible.',
    });
  }
}
