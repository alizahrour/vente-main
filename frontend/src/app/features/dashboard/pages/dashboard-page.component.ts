import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { forkJoin } from 'rxjs';
import { Dashboard, DashboardMetric } from '../../../core/models/dashboard.models';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: false,
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueChart') revenueChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('agentChart') agentChart?: ElementRef<HTMLCanvasElement>;

  dashboard: Dashboard | null = null;
  salesByOffer: DashboardMetric[] = [];
  salesByAgent: DashboardMetric[] = [];
  revenueByMonth: DashboardMetric[] = [];
  loading = true;
  errorMessage = '';
  private revenueChartInstance?: Chart;
  private agentChartInstance?: Chart;

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    this.renderCharts();
  }

  ngOnDestroy(): void {
    this.revenueChartInstance?.destroy();
    this.agentChartInstance?.destroy();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      dashboard: this.dashboardService.getDashboard(),
      salesByOffer: this.dashboardService.getSalesByOffer(),
      salesByAgent: this.dashboardService.getSalesByAgent(),
      revenueByMonth: this.dashboardService.getRevenueByMonth(),
    }).subscribe({
      next: ({ dashboard, salesByOffer, salesByAgent, revenueByMonth }) => {
        this.dashboard = dashboard;
        this.salesByOffer = salesByOffer;
        this.salesByAgent = salesByAgent;
        this.revenueByMonth = revenueByMonth;
        this.loading = false;
        setTimeout(() => this.renderCharts());
      },
      error: (error) => {
        this.errorMessage = error.error?.message ?? 'Chargement du dashboard impossible.';
        this.loading = false;
      },
    });
  }

  formatCurrency(value: number | undefined): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(value ?? 0);
  }

  private renderCharts(): void {
    this.renderRevenueChart();
    this.renderAgentChart();
  }

  private renderRevenueChart(): void {
    const canvas = this.revenueChart?.nativeElement;
    if (!canvas || !this.revenueByMonth.length) {
      this.revenueChartInstance?.destroy();
      this.revenueChartInstance = undefined;
      return;
    }

    this.revenueChartInstance?.destroy();
    this.revenueChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.revenueByMonth.map((item) => item.label),
        datasets: [{
          label: 'Revenu MAD',
          data: this.revenueByMonth.map((item) => item.value),
          backgroundColor: '#0f3a66',
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
      },
    });
  }

  private renderAgentChart(): void {
    const canvas = this.agentChart?.nativeElement;
    if (!canvas || !this.salesByAgent.length) {
      this.agentChartInstance?.destroy();
      this.agentChartInstance = undefined;
      return;
    }

    this.agentChartInstance?.destroy();
    this.agentChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.salesByAgent.map((item) => item.label),
        datasets: [{
          data: this.salesByAgent.map((item) => item.value),
          backgroundColor: ['#0f3a66', '#1769e0', '#039855', '#f79009', '#7a5af8', '#64748b'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }
}
