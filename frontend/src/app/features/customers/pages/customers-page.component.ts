import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import {
  CUSTOMER_CATEGORY_TABS,
  CUSTOMER_SEARCH_CITIES,
  CUSTOMER_SEARCH_FIELDS,
  CUSTOMER_SEARCH_PAGE_SIZE,
  CUSTOMER_SEARCH_SUMMARY_ITEMS,
  EMPTY_CUSTOMER_SEARCH_CRITERIA,
  EMPTY_CUSTOMER_SEARCH_RESULT,
} from '../data/customer-search.constants';
import {
  CustomerCategoryTab,
  CustomerCategory,
  CustomerSearchRecord,
  CustomerSearchResult,
  CustomerSearchSummaryItem,
} from '../models/customer-search.models';
import { CustomerSearchService } from '../services/customer-search.service';

@Component({
  selector: 'app-customers-page',
  standalone: false,
  templateUrl: './customers-page.component.html',
  styleUrl: './customers-page.component.scss',
})
export class CustomersPageComponent {
  readonly searchFields = CUSTOMER_SEARCH_FIELDS;
  readonly cityOptions = CUSTOMER_SEARCH_CITIES;
  readonly pageSize = CUSTOMER_SEARCH_PAGE_SIZE;
  tabs: Array<CustomerCategoryTab & { count: number }> = this.createTabs(this.createEmptyResult());
  activeRecords: CustomerSearchRecord[] = [];
  paginatedRecords: CustomerSearchRecord[] = [];
  pageStart = 0;
  pageEnd = 0;
  activeRecordsCount = 0;
  hasAnyResults = false;
  hasPreviousPage = false;
  hasNextPage = false;
  readonly searchForm;

  searchResult: CustomerSearchResult = this.createEmptyResult();
  activeCategory: CustomerCategory = 'individual';
  currentPage = 1;
  loading = false;
  hasSearched = false;
  isEditingCriteria = false;
  errorMessage = '';
  validationMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    public readonly authService: AuthService,
    private readonly customerSearchService: CustomerSearchService
  ) {
    this.searchForm = this.fb.nonNullable.group({
      callNumber: [''],
      publicKey: [''],
      lastName: [''],
      ccu: [''],
      idNumber: [''],
      clientCode: [''],
      firstName: [''],
      contractCode: [''],
      simCard: [''],
      city: [''],
      ice: [''],
      email: [''],
    });

    this.syncResultView();
  }

  get filledCriteriaCount(): number {
    return Object.values(this.searchForm.getRawValue()).filter((value) => value.trim()).length;
  }

  get summaryItems(): CustomerSearchSummaryItem[] {
    const rawValues = this.searchForm.getRawValue();

    return CUSTOMER_SEARCH_SUMMARY_ITEMS.map((item) => {
      if (item.type === 'separator' || !item.name || !item.label) {
        return item;
      }

      const value = rawValues[item.name].trim();
      return {
        ...item,
        value,
        active: Boolean(value),
      };
    });
  }

  search(): void {
    this.validationMessage = '';
    this.errorMessage = '';

    if (!this.filledCriteriaCount) {
      this.validationMessage = 'Saisissez au moins un critere de recherche.';
      return;
    }

    this.loading = true;
    this.currentPage = 1;

    this.customerSearchService.search(this.searchForm.getRawValue()).subscribe({
      next: (result) => {
        this.deferSearchStateUpdate(() => {
          this.searchResult = result;
          this.activeCategory = this.getDefaultCategory(result);
          this.hasSearched = true;
          this.isEditingCriteria = false;
          this.loading = false;
          this.syncResultView();
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.deferSearchStateUpdate(() => {
          this.searchResult = this.createEmptyResult();
          this.activeCategory = 'individual';
          this.errorMessage = error.error?.message ?? error.message ?? 'Recherche client impossible.';
          this.hasSearched = true;
          this.isEditingCriteria = false;
          this.loading = false;
          this.syncResultView();
          this.cdr.detectChanges();
        });
      },
    });
  }

  refresh(): void {
    this.searchForm.reset(EMPTY_CUSTOMER_SEARCH_CRITERIA);
    this.searchResult = this.createEmptyResult();
    this.activeCategory = 'individual';
    this.currentPage = 1;
    this.loading = false;
    this.hasSearched = false;
    this.isEditingCriteria = false;
    this.errorMessage = '';
    this.validationMessage = '';
    this.syncResultView();
  }

  openCriteriaEditor(): void {
    this.isEditingCriteria = true;
  }

  closeCriteriaEditor(): void {
    this.isEditingCriteria = false;
  }

  selectCategory(category: CustomerCategory): void {
    this.activeCategory = category;
    this.currentPage = 1;
    this.syncResultView();
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage -= 1;
      this.syncResultView();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage += 1;
      this.syncResultView();
    }
  }

  private getDefaultCategory(result: CustomerSearchResult): CustomerCategory {
    if (result.individuals.length > 0) {
      return 'individual';
    }

    if (result.corporates.length > 0) {
      return 'corporate';
    }

    if (result.dealers.length > 0) {
      return 'dealer';
    }

    if (result.legacy.length > 0) {
      return 'legacy';
    }

    return 'individual';
  }

  private deferSearchStateUpdate(callback: () => void): void {
    Promise.resolve().then(() => {
      this.ngZone.run(callback);
    });
  }

  private createEmptyResult(): CustomerSearchResult {
    return {
      individuals: [...EMPTY_CUSTOMER_SEARCH_RESULT.individuals],
      corporates: [...EMPTY_CUSTOMER_SEARCH_RESULT.corporates],
      dealers: [...EMPTY_CUSTOMER_SEARCH_RESULT.dealers],
      legacy: [...EMPTY_CUSTOMER_SEARCH_RESULT.legacy],
    };
  }

  private syncResultView(): void {
    this.tabs = this.createTabs(this.searchResult);
    this.activeRecords = this.getRecordsForCategory(this.activeCategory);
    this.activeRecordsCount = this.activeRecords.length;
    this.hasAnyResults =
      this.searchResult.individuals.length +
        this.searchResult.corporates.length +
        this.searchResult.dealers.length +
        this.searchResult.legacy.length >
      0;
    this.pageStart = this.activeRecordsCount ? (this.currentPage - 1) * this.pageSize + 1 : 0;
    this.pageEnd = Math.min(this.currentPage * this.pageSize, this.activeRecordsCount);
    this.hasPreviousPage = this.currentPage > 1;
    this.hasNextPage = this.pageEnd < this.activeRecordsCount;
    this.paginatedRecords = this.activeRecords.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }

  private getRecordsForCategory(category: CustomerCategory): CustomerSearchRecord[] {
    if (category === 'corporate') {
      return this.searchResult.corporates;
    }

    if (category === 'dealer') {
      return this.searchResult.dealers;
    }

    if (category === 'legacy') {
      return this.searchResult.legacy;
    }

    return this.searchResult.individuals;
  }

  private createTabs(result: CustomerSearchResult): Array<CustomerCategoryTab & { count: number }> {
    return CUSTOMER_CATEGORY_TABS.map((tab) => ({
      ...tab,
      count: this.getCountForCategory(result, tab.key),
    }));
  }

  private getCountForCategory(result: CustomerSearchResult, category: CustomerCategory): number {
    if (category === 'corporate') {
      return result.corporates.length;
    }

    if (category === 'dealer') {
      return result.dealers.length;
    }

    if (category === 'legacy') {
      return result.legacy.length;
    }

    return result.individuals.length;
  }
}
