import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateQuotePayload, Quote } from '../models/quote.models';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  constructor(private readonly http: HttpClient) {}

  createQuote(payload: CreateQuotePayload): Observable<Quote> {
    return this.http.post<Quote>(`${environment.apiUrl}/quotes`, payload);
  }

  getQuote(id: number): Observable<Quote> {
    return this.http.get<Quote>(`${environment.apiUrl}/quotes/${id}`);
  }
}
