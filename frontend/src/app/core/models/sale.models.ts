export interface SaleItemPayload {
  offerId: number;
  quantity: number;
}

export interface SalePayload {
  customerId: number;
  items: SaleItemPayload[];
}

export interface SaleItem {
  id: number;
  offerId: number;
  offerCode: string;
  offerName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Sale {
  id: number;
  saleNumber: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  status: 'DRAFT' | 'VALIDATED' | 'PAID' | 'CANCELLED';
  cancellationReason: string | null;
  totalAmount: number;
  paid: boolean;
  createdAt: string;
  validatedAt: string | null;
  agent: string;
  items: SaleItem[];
}

export interface PaymentPayload {
  amount: number;
  method: 'CASH' | 'CARD' | 'TRANSFER' | 'CHECK';
}

export interface PaymentResponse {
  id: number;
  saleId: number;
  amount: number;
  method: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  paidAt: string;
  reference: string;
  invoiceNumber: string;
}

export interface Invoice {
  invoiceNumber: string;
  saleId: number;
  saleNumber: string;
  generatedAt: string;
  customerName: string;
  customerCin: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string | null;
  customerCity: string | null;
  agentName: string;
  agentUsername: string;
  totalAmount: number;
  method: string;
  paymentReference: string;
  items: SaleItem[];
}
