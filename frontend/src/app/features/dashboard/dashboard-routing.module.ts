import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page.component';

const routes: Routes = [
  { path: '', component: DashboardPageComponent, data: { roles: ['ADMIN', 'SUPERVISOR', 'AGENT'] } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
