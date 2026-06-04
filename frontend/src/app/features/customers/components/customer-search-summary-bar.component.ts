import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerSearchSummaryItem } from '../models/customer-search.models';

@Component({
  selector: 'app-customer-search-summary-bar',
  standalone: false,
  templateUrl: './customer-search-summary-bar.component.html',
  styleUrl: './customer-search-summary-bar.component.scss',
})
export class CustomerSearchSummaryBarComponent {
  @Input() items: CustomerSearchSummaryItem[] = [];
  @Input() isEditing = false;

  @Output() readonly editRequested = new EventEmitter<void>();
  @Output() readonly closeRequested = new EventEmitter<void>();
}
