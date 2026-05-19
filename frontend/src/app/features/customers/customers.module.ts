import { NgModule } from '@angular/core';
import { CustomersPageComponent } from './pages/customers-page.component';
import { CustomerFormPageComponent } from './pages/customer-form-page.component';
import { SharedModule } from '../../shared/shared.module';
import { CustomersRoutingModule } from './customers-routing.module';

@NgModule({
  declarations: [CustomersPageComponent, CustomerFormPageComponent],
  imports: [SharedModule, CustomersRoutingModule],
})
export class CustomersModule {}
