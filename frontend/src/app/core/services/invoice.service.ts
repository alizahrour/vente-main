import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice } from '../models/sale.models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  constructor(private readonly http: HttpClient) {}

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${environment.apiUrl}/invoices`);
  }

  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${environment.apiUrl}/invoices/${id}`);
  }

  getInvoiceBySale(saleId: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${environment.apiUrl}/invoices/sale/${saleId}`);
  }
}
