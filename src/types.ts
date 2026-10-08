export type TransactionType = 'INCOME' | 'EXPENSE' | 'CREDIT';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  consolidated: boolean;
  cardName?: string;
  accountId?: string;
  accountName?: string;
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

export interface CreditCardItem {
  id: string;
  name: string;
  brand: string;
  limit?: number;
  closingDay?: number;
  dueDay?: number;
  color?: string;
  border?: string;
  badge?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CASH' | 'OTHER';

export interface AccountItem {
  id: string;
  name: string;
  bank?: string;
  type: AccountType;
  balance: number;
  color?: string;
  icon?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoryNature = 'EXPENSE' | 'INCOME' | 'BOTH';

export interface CategoryItem {
  id: string;
  name: string;
  type: CategoryNature;
  color?: string;
  icon?: string;
  budget?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}
