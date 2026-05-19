export type OfferCategory = 'MOBILE' | 'INTERNET' | 'FIBRE' | 'ADSL' | 'BOX' | 'RECHARGE';

export interface Offer {
  id: number;
  code: string;
  name: string;
  category: OfferCategory;
  description: string | null;
  price: number;
  duration: number;
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
