import { NgModule } from '@angular/core';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { SharedModule } from '../../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
  declarations: [DashboardPageComponent],
  imports: [SharedModule, DashboardRoutingModule],
})
export class DashboardModule {}
