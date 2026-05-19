import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardService } from '../../../core/services/dashboard.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let component: DashboardPageComponent;
  let dashboardService: jasmine.SpyObj<DashboardService>;

  beforeEach(async () => {
    dashboardService = jasmine.createSpyObj<DashboardService>('DashboardService', [
      'getDashboard',
      'getSalesByOffer',
      'getSalesByAgent',
      'getRevenueByMonth',
    ]);
    dashboardService.getDashboard.and.returnValue(of({
      totalCustomers: 2,
      totalOffers: 3,
      totalSales: 4,
      draftSales: 1,
      validatedSales: 1,
      paidSales: 2,
      cancelledSales: 0,
      totalRevenue: 500,
      recentSales: [],
    }));
    dashboardService.getSalesByOffer.and.returnValue(of([{ label: 'Fibre 100M', value: 2 }]));
    dashboardService.getSalesByAgent.and.returnValue(of([{ label: 'Agent Telecom', value: 2 }]));
    dashboardService.getRevenueByMonth.and.returnValue(of([{ label: '2026-05', value: 500 }]));

    await TestBed.configureTestingModule({
      declarations: [DashboardPageComponent, StatCardComponent],
      providers: [{ provide: DashboardService, useValue: dashboardService }],
    })
      .overrideComponent(DashboardPageComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
  });

  it('le dashboard charge les indicateurs', () => {
    fixture.detectChanges();

    expect(dashboardService.getDashboard).toHaveBeenCalled();
    expect(dashboardService.getSalesByOffer).toHaveBeenCalled();
    expect(dashboardService.getSalesByAgent).toHaveBeenCalled();
    expect(dashboardService.getRevenueByMonth).toHaveBeenCalled();
    expect(component.dashboard?.paidSales).toBe(2);
    expect(component.dashboard?.totalRevenue).toBe(500);
    expect(component.loading).toBeFalse();
  });
});
