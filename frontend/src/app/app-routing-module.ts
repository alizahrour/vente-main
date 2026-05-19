import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        data: { roles: ['ADMIN', 'SUPERVISOR', 'AGENT'] },
        loadChildren: () => import('./features/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'customers',
        data: { roles: ['ADMIN', 'AGENT'] },
        loadChildren: () => import('./features/customers/customers.module').then((m) => m.CustomersModule),
      },
      {
        path: 'offers',
        data: { roles: ['ADMIN', 'AGENT'] },
        loadChildren: () => import('./features/offers/offers.module').then((m) => m.OffersModule),
      },
      {
        path: 'sales',
        data: { roles: ['ADMIN', 'AGENT', 'SUPERVISOR'] },
        loadChildren: () => import('./features/sales/sales.module').then((m) => m.SalesModule),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
