export interface RecentSale {
  saleId: number;
  saleNumber: string;
  customerName: string;
  agentName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface Dashboard {
  totalCustomers: number;
  totalOffers: number;
  totalSales: number;
  draftSales: number;
  validatedSales: number;
  paidSales: number;
  cancelledSales: number;
  totalRevenue: number;
  recentSales: RecentSale[];
}

export interface DashboardMetric {
  label: string;
  value: number;
}
