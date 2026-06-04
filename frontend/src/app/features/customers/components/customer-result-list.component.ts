import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerSearchRecord } from '../models/customer-search.models';

@Component({
  selector: 'app-customer-result-list',
  standalone: false,
  templateUrl: './customer-result-list.component.html',
  styleUrl: './customer-result-list.component.scss',
})
export class CustomerResultListComponent {
  @Input() records: CustomerSearchRecord[] = [];
  @Input() pageStart = 0;
  @Input() pageEnd = 0;
  @Input() total = 0;
  @Input() hasPreviousPage = false;
  @Input() hasNextPage = false;

  @Output() readonly previousPage = new EventEmitter<void>();
  @Output() readonly nextPage = new EventEmitter<void>();

  trackById(_: number, record: CustomerSearchRecord): number {
    return record.id;
  }
}
