import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Offer, OfferPayload } from '../models/offer.models';

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
