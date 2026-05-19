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
