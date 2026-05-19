import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Customer } from '../../../core/models/customer.models';
import { CustomerService } from '../../../core/services/customer.service';
import { SaleService } from '../../../core/services/sale.service';

@Component({
  selector: 'app-sale-workspace-page',
  standalone: false,
  templateUrl: './sale-workspace-page.component.html',
  styleUrl: './sale-workspace-page.component.scss',
})
export class SaleWorkspacePageComponent implements OnInit {
  customers: Customer[] = [];
  errorMessage = '';
  saving = false;

  readonly form = this.fb.group({
    customerId: [null as number | null, Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly customerService: CustomerService,
    private readonly saleService: SaleService
  ) {}

  ngOnInit(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => this.customers = customers,
      error: (error) => this.errorMessage = error.error?.message ?? 'Chargement des clients impossible.',
    });
  }

  createSale(): void {
    if (this.form.invalid || !this.form.controls.customerId.value) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.saleService.createSale({ customerId: this.form.controls.customerId.value, items: [] }).subscribe({
      next: (sale) => this.router.navigate(['/sales', sale.id]),
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Création de la vente impossible.';
        this.saving = false;
      },
    });
  }
}
