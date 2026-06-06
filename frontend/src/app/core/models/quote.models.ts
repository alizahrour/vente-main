export type QuoteCustomerType = 'INDIVIDUAL' | 'DEALER' | 'ANONYMOUS';
export type QuotePaymentType = 'UPFRONT' | 'CREDIT';
export type QuoteCreditDuration = 'NA' | 'MONTH_12' | 'MONTH_18' | 'MONTH_24';
export type QuoteStatus = 'DRAFT' | 'CANCELLED' | 'CHECKED_OUT';
export type QuoteOrderSegment = 'RETAIL';
export type QuoteNetworkType = 'DIRECT_NETWORK';
export type QuoteOrderStartType = 'IMMEDIATE';

export interface CreateQuotePayload {
  customerId: number;
  customerContact: string | null;
  billingAccount: string;
  orderSegment: QuoteOrderSegment;
  networkType: QuoteNetworkType;
  creditDuration: QuoteCreditDuration;
  quoteExpirationDate: string;
  orderStartType: QuoteOrderStartType;
  description: string;
}

export interface QuoteItem {
  id: number;
  offerId: number;
  offerCode: string;
  offerName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Quote {
  id: number;
  quoteNumber: string;
  customerId: number | null;
  customerNameSnapshot: string | null;
  customerContactSnapshot: string | null;
  billingAccount: string;
  orderSegment: QuoteOrderSegment;
  networkType: QuoteNetworkType;
  customerType: QuoteCustomerType;
  paymentType: QuotePaymentType;
  creditDuration: QuoteCreditDuration;
  quoteExpirationDate: string;
  orderStartType: QuoteOrderStartType;
  description: string | null;
  status: QuoteStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: QuoteItem[];
}
