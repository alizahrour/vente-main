import { NgModule } from '@angular/core';
import { InvoicePageComponent } from './pages/invoice-page.component';
import { ReceiptPageComponent } from './pages/receipt-page.component';
import { PaymentPageComponent } from './pages/payment-page.component';
import { SaleDetailPageComponent } from './pages/sale-detail-page.component';
import { SaleWorkspacePageComponent } from './pages/sale-workspace-page.component';
import { SalesHistoryPageComponent } from './pages/sales-history-page.component';
import { SharedModule } from '../../shared/shared.module';
import { SalesRoutingModule } from './sales-routing.module';

@NgModule({
  declarations: [
    SaleWorkspacePageComponent,
    SaleDetailPageComponent,
    PaymentPageComponent,
    SalesHistoryPageComponent,
    InvoicePageComponent,
    ReceiptPageComponent,
  ],
  imports: [SharedModule, SalesRoutingModule],
})
export class SalesModule {}
