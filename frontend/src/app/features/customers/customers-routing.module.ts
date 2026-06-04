import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersPageComponent } from './pages/customers-page.component';
import { CustomerFormPageComponent } from './pages/customer-form-page.component';
import { CustomerDetailPageComponent } from './pages/customer-detail-page.component';

const routes: Routes = [
  { path: 'new', component: CustomerFormPageComponent, data: { roles: ['ADMIN'] } },
  { path: ':id/edit', component: CustomerFormPageComponent, data: { roles: ['ADMIN'] } },
  { path: ':id', component: CustomerDetailPageComponent, data: { roles: ['ADMIN', 'AGENT'] } },
  { path: '', component: CustomersPageComponent, data: { roles: ['ADMIN', 'AGENT'] } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomersRoutingModule {}
