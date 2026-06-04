import { NgModule } from '@angular/core';
import { CustomerCategoryTabsComponent } from './components/customer-category-tabs.component';
import { CustomerResultCardComponent } from './components/customer-result-card.component';
import { CustomerResultListComponent } from './components/customer-result-list.component';
import { CustomerSearchFormComponent } from './components/customer-search-form.component';
import { CustomerSearchSummaryBarComponent } from './components/customer-search-summary-bar.component';
import { CustomersPageComponent } from './pages/customers-page.component';
import { CustomerFormPageComponent } from './pages/customer-form-page.component';
import { CustomerDetailPageComponent } from './pages/customer-detail-page.component';
import { SharedModule } from '../../shared/shared.module';
import { CustomersRoutingModule } from './customers-routing.module';

@NgModule({
  declarations: [
    CustomersPageComponent,
    CustomerFormPageComponent,
    CustomerDetailPageComponent,
    CustomerSearchFormComponent,
    CustomerSearchSummaryBarComponent,
    CustomerCategoryTabsComponent,
    CustomerResultListComponent,
    CustomerResultCardComponent,
  ],
  imports: [SharedModule, CustomersRoutingModule],
})
export class CustomersModule {}
