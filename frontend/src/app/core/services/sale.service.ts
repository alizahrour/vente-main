import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PaymentPayload,
  PaymentResponse,
  Invoice,
  Sale,
  SaleItemPayload,
  SalePayload,
} from '../models/sale.models';

@Injectable({ providedIn: 'root' })
export class SaleService {
  constructor(private readonly http: HttpClient) {}

  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${environment.apiUrl}/sales`);
  }

  createSale(payload: SalePayload): Observable<Sale> {
    return this.http.post<Sale>(`${environment.apiUrl}/sales`, payload);
  }

  updateSale(id: number, payload: SalePayload): Observable<Sale> {
    return this.http.put<Sale>(`${environment.apiUrl}/sales/${id}`, payload);
  }

  getSale(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${environment.apiUrl}/sales/${id}`);
  }

  addItem(id: number, payload: SaleItemPayload): Observable<Sale> {
    return this.http.post<Sale>(`${environment.apiUrl}/sales/${id}/items`, payload);
  }

  updateItem(id: number, itemId: number, payload: SaleItemPayload): Observable<Sale> {
    return this.http.put<Sale>(`${environment.apiUrl}/sales/${id}/items/${itemId}`, payload);
  }

  deleteItem(id: number, itemId: number): Observable<Sale> {
    return this.http.delete<Sale>(`${environment.apiUrl}/sales/${id}/items/${itemId}`);
  }

  validateSale(id: number): Observable<Sale> {
    return this.http.post<Sale>(`${environment.apiUrl}/sales/${id}/validate`, {});
  }

  cancelSale(id: number, reason: string): Observable<Sale> {
    return this.http.post<Sale>(`${environment.apiUrl}/sales/${id}/cancel`, { reason });
  }

  paySale(id: number, payload: PaymentPayload): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${environment.apiUrl}/sales/${id}/payment`, payload);
  }

  createInvoice(saleId: number): Observable<Invoice> {
    return this.http.post<Invoice>(`${environment.apiUrl}/invoices/sale/${saleId}`, {});
  }

  getInvoice(saleId: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${environment.apiUrl}/invoices/sale/${saleId}`);
  }
}
