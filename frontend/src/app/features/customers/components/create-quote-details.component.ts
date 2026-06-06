import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Customer } from '../../../core/models/customer.models';
import {
  CreateQuotePayload,
  QuoteCreditDuration,
  QuoteNetworkType,
  QuoteOrderSegment,
} from '../../../core/models/quote.models';

interface QuoteSelectOption<T extends string> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-create-quote-details',
  standalone: false,
  templateUrl: './create-quote-details.component.html',
  styleUrl: './create-quote-details.component.scss',
})
export class CreateQuoteDetailsComponent implements OnInit {
  @Input({ required: true }) customer!: Customer;
  @Input() saving = false;
  @Input() errorMessage = '';

  @Output() readonly cancelRequested = new EventEmitter<void>();
  @Output() readonly continueRequested = new EventEmitter<CreateQuotePayload>();

  readonly quoteForm;
  readonly creditDurationOptions: Array<QuoteSelectOption<QuoteCreditDuration>> = [
    { label: 'N/A', value: 'NA' },
    { label: '12 Mois', value: 'MONTH_12' },
    { label: '18 Mois', value: 'MONTH_18' },
    { label: '24 Mois', value: 'MONTH_24' },
  ];
  readonly orderSegmentOptions: Array<QuoteSelectOption<QuoteOrderSegment>> = [
    { label: 'Commerce de detail', value: 'RETAIL' },
  ];
  readonly networkTypeOptions: Array<QuoteSelectOption<QuoteNetworkType>> = [
    { label: 'Reseau direct', value: 'DIRECT_NETWORK' },
  ];
  contactOptions: Array<QuoteSelectOption<string>> = [];
  billingAccountOptions: Array<QuoteSelectOption<string>> = [];
  submitAttempted = false;

  constructor(private readonly fb: FormBuilder) {
    this.quoteForm = this.fb.nonNullable.group({
      customerContact: ['', Validators.required],
      quoteExpirationDate: [this.buildDefaultExpirationDate(), Validators.required],
      orderSegment: ['RETAIL' as QuoteOrderSegment, Validators.required],
      billingAccount: ['', Validators.required],
      networkType: ['DIRECT_NETWORK' as QuoteNetworkType, Validators.required],
      creditDuration: ['NA' as QuoteCreditDuration, Validators.required],
      description: [''],
    });
  }

  get orderStartLabel(): string {
    return 'Immediatement';
  }

  ngOnInit(): void {
    this.contactOptions = this.buildContactOptions();
    this.billingAccountOptions = this.buildBillingAccountOptions();

    this.quoteForm.patchValue({
      customerContact: this.contactOptions[0]?.value ?? '',
      billingAccount: this.billingAccountOptions[0]?.value ?? '',
    });
  }

  submit(): void {
    this.submitAttempted = true;

    if (!this.customer || this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    const formValue = this.quoteForm.getRawValue();

    this.continueRequested.emit({
      customerId: this.customer.id,
      customerContact: this.normalizeOptionalValue(formValue.customerContact),
      billingAccount: formValue.billingAccount,
      orderSegment: formValue.orderSegment,
      networkType: formValue.networkType,
      creditDuration: formValue.creditDuration,
      quoteExpirationDate: formValue.quoteExpirationDate,
      orderStartType: 'IMMEDIATE',
      description: formValue.description.trim(),
    });
  }

  private buildContactOptions(): Array<QuoteSelectOption<string>> {
    const options = this.buildUniqueOptions([
      this.customer.email,
      this.customer.phone,
    ]);

    return options.length ? options : [{ label: 'Non renseigne', value: 'Non renseigne' }];
  }

  private buildBillingAccountOptions(): Array<QuoteSelectOption<string>> {
    const invoiceReferences = this.customer.profile?.invoices.map((invoice) => invoice.reference) ?? [];
    const contractReferences = this.customer.profile?.contracts.map((contract) => contract.reference) ?? [];
    const options = this.buildUniqueOptions([...invoiceReferences, ...contractReferences]);

    return options.length ? options : [{ label: 'Non renseigne', value: 'Non renseigne' }];
  }

  private buildUniqueOptions(values: Array<string | null | undefined>): Array<QuoteSelectOption<string>> {
    const uniqueValues = Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim()))));
    return uniqueValues.map((value) => ({ label: value, value }));
  }

  private buildDefaultExpirationDate(): string {
    const now = new Date();
    const expirationDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    const year = expirationDate.getFullYear();
    const month = `${expirationDate.getMonth() + 1}`.padStart(2, '0');
    const day = `${expirationDate.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private normalizeOptionalValue(value: string): string | null {
    return value && value !== 'Non renseigne' ? value : null;
  }
}
