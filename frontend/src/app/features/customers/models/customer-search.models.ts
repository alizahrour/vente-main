export type CustomerCategory = 'individual' | 'corporate' | 'dealer' | 'legacy';

export interface CustomerSearchCriteria {
  callNumber: string;
  publicKey: string;
  lastName: string;
  ccu: string;
  idNumber: string;
  clientCode: string;
  firstName: string;
  contractCode: string;
  simCard: string;
  city: string;
  ice: string;
  email: string;
}

export interface CustomerSearchField {
  name: keyof CustomerSearchCriteria;
  label: string;
  placeholder: string;
  isCityField?: boolean;
}

export interface CustomerSearchSummaryItem {
  type: 'field' | 'separator';
  name?: keyof CustomerSearchCriteria;
  label?: string;
  value?: string;
  active?: boolean;
}

export interface CustomerSearchRecordContract {
  contractNumber: string;
  activationDate: string;
  imsi: string;
  nd: string;
  offer: string;
}

export interface CustomerSearchRecord {
  id: number;
  category: CustomerCategory;
  displayName: string;
  customerNumber: string;
  identityType?: string;
  identityNumber?: string;
  segment?: string;
  customerClass?: string;
  addressLines: string[];
  contracts: CustomerSearchRecordContract[];
}

export interface CustomerSearchResult {
  individuals: CustomerSearchRecord[];
  corporates: CustomerSearchRecord[];
  dealers: CustomerSearchRecord[];
  legacy: CustomerSearchRecord[];
}

export interface CustomerCategoryTab {
  key: CustomerCategory;
  label: string;
  icon: 'user' | 'company' | 'dealer' | 'legacy';
}
