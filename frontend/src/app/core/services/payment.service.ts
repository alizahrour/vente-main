import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentResponse } from '../models/sale.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private readonly http: HttpClient) {}

  getPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${environment.apiUrl}/payments`);
  }

  getPayment(id: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${environment.apiUrl}/payments/${id}`);
  }
}
