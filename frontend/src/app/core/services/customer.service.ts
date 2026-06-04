import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SIMULATED_CUSTOMERS } from '../data/simulated-customers';
import { Customer, CustomerPayload } from '../models/customer.models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  constructor(private readonly http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${environment.apiUrl}/customers`).pipe(
      map((customers) => this.mergeWithSimulatedCustomers(customers)),
      catchError(() => of(SIMULATED_CUSTOMERS))
    );
  }

  getCustomer(id: number): Observable<Customer> {
    const simulatedCustomer = this.findSimulatedCustomer(id);
    if (simulatedCustomer) {
      return of(simulatedCustomer);
    }

    return this.http.get<Customer>(`${environment.apiUrl}/customers/${id}`).pipe(
      map((customer) => this.enrichCustomer(customer))
    );
  }

  searchCustomers(keyword: string): Observable<Customer[]> {
    const simulatedMatches = this.searchSimulatedCustomers(keyword);

    return this.http.get<Customer[]>(`${environment.apiUrl}/customers/search`, {
      params: { keyword },
    }).pipe(
      map((customers) => this.mergeWithSimulatedCustomers(customers, simulatedMatches)),
      catchError(() => of(simulatedMatches))
    );
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

  private mergeWithSimulatedCustomers(
    apiCustomers: Customer[],
    simulatedCustomers = SIMULATED_CUSTOMERS
  ): Customer[] {
    const enrichedApiCustomers = apiCustomers.map((customer) => this.enrichCustomer(customer));
    const mergedSimulatedCustomers = simulatedCustomers.map((simulatedCustomer) => {
      const matchingApiCustomer = enrichedApiCustomers.find((apiCustomer) =>
        this.hasSharedCustomerKey(apiCustomer, simulatedCustomer)
      );

      return matchingApiCustomer ?? simulatedCustomer;
    });
    const simulatedCustomerKeys = new Set(mergedSimulatedCustomers.flatMap((customer) => this.getCustomerKeys(customer)));
    const uniqueApiCustomers = enrichedApiCustomers.filter((customer) =>
      this.getCustomerKeys(customer).every((key) => !simulatedCustomerKeys.has(key))
    );

    return [...mergedSimulatedCustomers, ...uniqueApiCustomers];
  }

  private findSimulatedCustomer(id: number): Customer | undefined {
    return SIMULATED_CUSTOMERS.find((customer) => customer.id === id);
  }

  private enrichCustomer(customer: Customer): Customer {
    const simulatedCustomer = SIMULATED_CUSTOMERS.find((candidate) =>
      candidate.id === customer.id ||
      candidate.cin.toLowerCase() === customer.cin.toLowerCase() ||
      candidate.phone === customer.phone
    );

    return simulatedCustomer
      ? { ...simulatedCustomer, ...customer, profile: simulatedCustomer.profile }
      : customer;
  }

  private getCustomerKeys(customer: Customer): string[] {
    return [
      `id:${customer.id}`,
      `cin:${customer.cin.toLowerCase()}`,
      `phone:${customer.phone}`,
    ];
  }

  private hasSharedCustomerKey(firstCustomer: Customer, secondCustomer: Customer): boolean {
    const secondCustomerKeys = new Set(this.getCustomerKeys(secondCustomer));
    return this.getCustomerKeys(firstCustomer).some((key) => secondCustomerKeys.has(key));
  }

  private searchSimulatedCustomers(keyword: string): Customer[] {
    const terms = keyword
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    if (!terms.length) {
      return [];
    }

    return SIMULATED_CUSTOMERS.filter((customer) => {
      const profile = customer.profile;
      const searchableText = [
        customer.fullName,
        customer.firstName,
        customer.lastName,
        customer.cin,
        customer.phone,
        customer.email,
        customer.address,
        customer.city,
        profile?.customerNumber,
        profile?.agency,
        profile?.commercial.fullName,
        profile?.commercial.agency,
        ...(profile?.contracts.flatMap((contract) => [
          contract.reference,
          contract.imsi,
          contract.phone,
          contract.offer,
          contract.status,
        ]) ?? []),
      ]
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .toLowerCase();

      return terms.every((term) => searchableText.includes(term));
    });
  }
}
