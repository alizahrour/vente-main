import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Customer } from '../../../core/models/customer.models';
import { AuthService } from '../../../core/services/auth.service';
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
  searchResults: Customer[] = [];
  selectedCustomer: Customer | null = null;
  quoteDialogOpen = false;
  errorMessage = '';
  saving = false;

  readonly searchForm;
  readonly quoteForm;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    public readonly authService: AuthService,
    private readonly customerService: CustomerService,
    private readonly saleService: SaleService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.nonNullable.group({
      phone: [''],
      identityNumber: [''],
      simCard: [''],
      publicKey: [''],
      customerNumber: [''],
      city: [''],
      name: [''],
      firstName: [''],
      ice: [''],
      ccu: [''],
      contractCode: [''],
      email: [''],
    });

    this.quoteForm = this.fb.nonNullable.group({
      contact: [''],
      expirationDate: ['2026-05-22', Validators.required],
      orderStart: ['Immediatement', Validators.required],
      segment: ['Commerce de detail', Validators.required],
      billingAccount: ['Compte de facturation', Validators.required],
      networkType: ['Reseau direct', Validators.required],
      creditDuration: ['N/A', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.searchResults = customers;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Chargement des clients impossible.';
        this.cdr.detectChanges();
      },
    });
  }

  searchCustomers(): void {
    this.errorMessage = '';
    const values = this.searchForm.getRawValue();
    const keyword = [
      values.phone,
      values.identityNumber,
      values.customerNumber,
      values.city,
      values.name,
      values.firstName,
      values.contractCode,
      values.email,
    ].find((value) => value.trim().length > 0)?.trim();

    if (!keyword) {
      this.searchResults = this.customers;
      return;
    }

    this.customerService.searchCustomers(keyword).subscribe({
      next: (customers) => {
        this.searchResults = customers;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Recherche client impossible.';
        this.cdr.detectChanges();
      },
    });
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.searchResults = this.customers;
    this.selectedCustomer = null;
    this.errorMessage = '';
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    this.quoteForm.patchValue({
      contact: customer.email ?? customer.phone,
      billingAccount: `Compte ${customer.id}`,
    });
  }

  openQuoteDialog(): void {
    if (!this.selectedCustomer) {
      this.errorMessage = 'Selectionnez un client avant de creer un panier.';
      return;
    }
    this.quoteDialogOpen = true;
  }

  closeQuoteDialog(): void {
    this.quoteDialogOpen = false;
  }

  createSale(): void {
    if (!this.selectedCustomer || this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.saving = true;
    this.saleService.createSale({ customerId: this.selectedCustomer.id, items: [] }).subscribe({
      next: (sale) => this.router.navigate(['/sales', sale.id]),
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Creation de la vente impossible.';
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }
}
