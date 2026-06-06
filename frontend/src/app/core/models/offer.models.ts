export type OfferCategory = 'MOBILE' | 'INTERNET' | 'FIBRE' | 'ADSL' | 'BOX' | 'RECHARGE';

export interface Offer {
  id: number;
  code: string;
  existingCode: string | null;
  name: string;
  category: OfferCategory;
  description: string | null;
  productTypeCode: string | null;
  productTypeDescription: string | null;
  brand: string | null;
  balance: string | null;
  hierarchyCode: string | null;
  price: number;
  duration: number;
  eligibleForNormalCustomer: boolean;
  bundle: boolean;
  active: boolean;
}

export interface OfferPayload {
  code: string;
  name: string;
  category: OfferCategory;
  description: string | null;
  price: number;
  duration: number;
  active: boolean;
}

export interface EligibleOfferQuery {
  quoteId: number;
  page?: number;
  size?: number;
  search?: string;
  hierarchyCode?: string;
  productTypeCode?: string;
  bundle?: boolean | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
