import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuoteCatalogPageComponent } from './pages/quote-catalog-page.component';
import { QuoteDetailPageComponent } from './pages/quote-detail-page.component';

const routes: Routes = [
  { path: ':quoteId/catalog', component: QuoteCatalogPageComponent, data: { roles: ['ADMIN', 'AGENT'] } },
  { path: ':quoteId', component: QuoteDetailPageComponent, data: { roles: ['ADMIN', 'AGENT'] } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotesRoutingModule {}
