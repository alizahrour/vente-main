import { Component, Input } from '@angular/core';
import { CustomerSearchRecord } from '../models/customer-search.models';

@Component({
  selector: 'app-customer-result-card',
  standalone: false,
  templateUrl: './customer-result-card.component.html',
  styleUrl: './customer-result-card.component.scss',
})
export class CustomerResultCardComponent {
  @Input({ required: true }) record!: CustomerSearchRecord;

  get previewContracts() {
    return this.record.contracts.slice(0, 2);
  }

  get remainingContractsCount(): number {
    return Math.max(this.record.contracts.length - 2, 0);
  }
}
