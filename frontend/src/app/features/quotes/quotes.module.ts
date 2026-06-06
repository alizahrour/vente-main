import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { QuotesRoutingModule } from './quotes-routing.module';
import { QuoteCatalogPageComponent } from './pages/quote-catalog-page.component';
import { QuoteDetailPageComponent } from './pages/quote-detail-page.component';

@NgModule({
  declarations: [QuoteCatalogPageComponent, QuoteDetailPageComponent],
  imports: [SharedModule, QuotesRoutingModule],
})
export class QuotesModule {}
