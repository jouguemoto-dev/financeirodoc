export type TransactionType = 'INCOME' | 'EXPENSE' | 'CREDIT';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  consolidated: boolean;
  cardName?: string;
  installmentInfo?: {
    current: number;
    total: number;
    parentPurchaseId?: string;
  };
  date?: string;
  notes?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type FilterType = 'ALL' | 'INCOME' | 'EXPENSE' | 'CREDIT';
export type FilterStatus = 'ALL' | 'CONSOLIDATED' | 'PENDING';
