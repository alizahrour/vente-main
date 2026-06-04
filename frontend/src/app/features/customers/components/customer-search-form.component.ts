import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CustomerSearchField } from '../models/customer-search.models';

@Component({
  selector: 'app-customer-search-form',
  standalone: false,
  templateUrl: './customer-search-form.component.html',
  styleUrl: './customer-search-form.component.scss',
})
export class CustomerSearchFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() fields: CustomerSearchField[] = [];
  @Input() cityOptions: string[] = [];
  @Input() loading = false;
  @Input() isEditMode = false;
  @Input() hasSearched = false;
  @Input() filledCriteriaCount = 0;
  @Input() validationMessage = '';

  @Output() readonly submitted = new EventEmitter<void>();
  @Output() readonly refreshed = new EventEmitter<void>();

  readonly cityListId = 'customer-search-city-options';
}
