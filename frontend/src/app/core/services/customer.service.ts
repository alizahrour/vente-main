import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Customer, CustomerPayload } from '../models/customer.models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  constructor(private readonly http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${environment.apiUrl}/customers`);
  }

  getCustomer(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${environment.apiUrl}/customers/${id}`);
  }

  searchCustomers(keyword: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${environment.apiUrl}/customers/search`, {
      params: { keyword },
    });
  }

  createCustomer(payload: CustomerPayload): Observable<Customer> {
    return this.http.post<Customer>(`${environment.apiUrl}/customers`, payload);
  }

  updateCustomer(id: number, payload: CustomerPayload): Observable<Customer> {
    return this.http.put<Customer>(`${environment.apiUrl}/customers/${id}`, payload);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/customers/${id}`);
  }
}
