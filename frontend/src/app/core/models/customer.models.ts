export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  cin: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  profile?: CustomerDetailProfile;
}

export interface CustomerPayload {
  firstName: string;
  lastName: string;
  cin: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
}

export type CustomerSearchCategory = 'individual' | 'corporate' | 'dealer' | 'legacy';

export interface CustomerDetailProfile {
  status: string;
  customerNumber: string;
  balance: number;
  overdueInvoicesCount: number;
  overdueTotal: number;
  contractCount: number;
  activeContractsCount: number;
  agency: string;
  category: string;
  segment: string;
  streetNumber: string;
  addressComplement: string;
  postalCode: string;
  country: string;
  identityType?: string;
  customerClass?: string;
  searchCategory?: CustomerSearchCategory;
  publicKey?: string;
  ice?: string;
  ccu?: string;
  commercial: CustomerCommercialAttachment;
  contractStatus: CustomerContractStatus;
  contracts: CustomerContract[];
  invoices: CustomerInvoice[];
  interactions: CustomerInteraction[];
}

export interface CustomerCommercialAttachment {
  fullName: string;
  email: string | null;
  phone: string | null;
  agency: string;
}

export interface CustomerContractStatus {
  prepaid: CustomerContractStatusLine;
  postpaid: CustomerContractStatusLine;
}

export interface CustomerContractStatusLine {
  active: number;
  suspended: number;
  terminated: number;
}

export interface CustomerContract {
  reference: string;
  activatedAt: string;
  imsi: string;
  phone: string;
  offer: string;
  status: string;
  type: 'prepaid' | 'postpaid';
}

export interface CustomerInvoice {
  reference: string;
  amount: number;
  remaining: number;
}

export interface CustomerInteraction {
  title: string;
  user: string;
  description: string;
  happenedAt: string;
}
