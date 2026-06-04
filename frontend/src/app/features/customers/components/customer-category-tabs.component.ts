import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerCategory, CustomerCategoryTab } from '../models/customer-search.models';

@Component({
  selector: 'app-customer-category-tabs',
  standalone: false,
  templateUrl: './customer-category-tabs.component.html',
  styleUrl: './customer-category-tabs.component.scss',
})
export class CustomerCategoryTabsComponent {
  @Input() tabs: Array<CustomerCategoryTab & { count: number }> = [];
  @Input() activeCategory: CustomerCategory = 'individual';

  @Output() readonly categorySelected = new EventEmitter<CustomerCategory>();
}
