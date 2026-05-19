import { NgModule } from '@angular/core';
import { OffersPageComponent } from './pages/offers-page.component';
import { OfferFormPageComponent } from './pages/offer-form-page.component';
import { SharedModule } from '../../shared/shared.module';
import { OffersRoutingModule } from './offers-routing.module';

@NgModule({
  declarations: [OffersPageComponent, OfferFormPageComponent],
  imports: [SharedModule, OffersRoutingModule],
})
export class OffersModule {}
