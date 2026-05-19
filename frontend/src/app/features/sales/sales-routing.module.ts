import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoicePageComponent } from './pages/invoice-page.component';
import { ReceiptPageComponent } from './pages/receipt-page.component';
import { PaymentPageComponent } from './pages/payment-page.component';
import { SaleDetailPageComponent } from './pages/sale-detail-page.component';
import { SaleWorkspacePageComponent } from './pages/sale-workspace-page.component';
import { SalesHistoryPageComponent } from './pages/sales-history-page.component';

const routes: Routes = [
  { path: 'new', component: SaleWorkspacePageComponent, data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'history', component: SalesHistoryPageComponent, data: { roles: ['ADMIN', 'AGENT', 'SUPERVISOR'] } },
  { path: ':id/payment', component: PaymentPageComponent, data: { roles: ['ADMIN', 'AGENT'] } },
  { path: ':id/invoice', component: InvoicePageComponent, data: { roles: ['ADMIN', 'AGENT'] } },
  { path: ':id', component: SaleDetailPageComponent, data: { roles: ['ADMIN', 'AGENT', 'SUPERVISOR'] } },
  { path: '', pathMatch: 'full', redirectTo: 'new' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesRoutingModule {}
