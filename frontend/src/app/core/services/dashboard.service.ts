import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Dashboard, DashboardMetric } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${environment.apiUrl}/dashboard/summary`);
  }

  getSalesByOffer(): Observable<DashboardMetric[]> {
    return this.http.get<DashboardMetric[]>(`${environment.apiUrl}/dashboard/sales-by-offer`);
  }

  getSalesByAgent(): Observable<DashboardMetric[]> {
    return this.http.get<DashboardMetric[]>(`${environment.apiUrl}/dashboard/sales-by-agent`);
  }

  getRevenueByMonth(): Observable<DashboardMetric[]> {
    return this.http.get<DashboardMetric[]>(`${environment.apiUrl}/dashboard/revenue-by-month`);
  }
}
