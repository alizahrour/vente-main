import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OffersPageComponent } from './pages/offers-page.component';
import { OfferFormPageComponent } from './pages/offer-form-page.component';

const routes: Routes = [
  { path: 'new', component: OfferFormPageComponent, data: { roles: ['ADMIN'] } },
  { path: ':id/edit', component: OfferFormPageComponent, data: { roles: ['ADMIN'] } },
  { path: '', component: OffersPageComponent, data: { roles: ['ADMIN', 'AGENT'] } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OffersRoutingModule {}
