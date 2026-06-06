import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EligibleOfferQuery, Offer, OfferPayload, PageResponse } from '../models/offer.models';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class OfferService {
  constructor(private readonly http: HttpClient) {}

  getOffers(activeOnly = false): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${environment.apiUrl}/offers`, {
      params: { activeOnly },
    });
  }

  getActiveOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${environment.apiUrl}/offers/active`);
  }

  getEligibleOffers(query: EligibleOfferQuery): Observable<PageResponse<Offer>> {
    let params = new HttpParams()
      .set('quoteId', query.quoteId)
      .set('page', query.page ?? 0)
      .set('size', query.size ?? 20);

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query.hierarchyCode?.trim()) {
      params = params.set('hierarchyCode', query.hierarchyCode.trim());
    }
    if (query.productTypeCode?.trim()) {
      params = params.set('productTypeCode', query.productTypeCode.trim());
    }
    if (query.bundle !== null && query.bundle !== undefined) {
      params = params.set('bundle', query.bundle);
    }

    return this.http.get<PageResponse<Offer>>(`${environment.apiUrl}/offers/eligible`, { params });
  }

  getOffer(id: number): Observable<Offer> {
    return this.http.get<Offer>(`${environment.apiUrl}/offers/${id}`);
  }

  createOffer(payload: OfferPayload): Observable<Offer> {
    return this.http.post<Offer>(`${environment.apiUrl}/offers`, payload);
  }

  updateOffer(id: number, payload: OfferPayload): Observable<Offer> {
    return this.http.put<Offer>(`${environment.apiUrl}/offers/${id}`, payload);
  }

  activateOffer(id: number): Observable<Offer> {
    return this.http.patch<Offer>(`${environment.apiUrl}/offers/${id}/activate`, {});
  }

  deactivateOffer(id: number): Observable<Offer> {
    return this.http.patch<Offer>(`${environment.apiUrl}/offers/${id}/deactivate`, {});
  }
}
