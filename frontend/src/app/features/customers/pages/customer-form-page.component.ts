import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-customer-form-page',
  standalone: false,
  templateUrl: './customer-form-page.component.html',
  styleUrl: './customer-form-page.component.scss',
})
export class CustomerFormPageComponent implements OnInit {
  customerId: number | null = null;
  errorMessage = '';
  saving = false;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    cin: ['', [Validators.required, Validators.maxLength(30)]],
    phone: ['', [Validators.required, Validators.maxLength(25)]],
    email: [''],
    address: [''],
    city: [''],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly customerService: CustomerService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.customerId = id;
      this.customerService.getCustomer(id).subscribe({
        next: (customer) => this.form.patchValue(customer),
        error: (error) => this.errorMessage = error.error?.message ?? 'Client introuvable.',
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    const payload = this.form.getRawValue();
    const request$ = this.customerId
      ? this.customerService.updateCustomer(this.customerId, payload)
      : this.customerService.createCustomer(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/customers']),
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Enregistrement impossible.';
        this.saving = false;
      },
    });
  }
}
