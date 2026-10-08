import { Transaction, CreditCardItem, AccountItem, CategoryItem } from '../types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Salário', amount: 2700.00, type: 'INCOME', category: 'Renda', consolidated: true, accountName: 'Conta Principal (Nubank)' },
  { id: '2', description: 'IBE', amount: 87.17, type: 'INCOME', category: 'Renda Extra', consolidated: true, accountName: 'Conta Principal (Nubank)' },
  { id: '3', description: 'Cartão Neon', amount: 527.00, type: 'CREDIT', category: 'Cartão de Crédito', consolidated: false, cardName: 'Cartão Neon' },
  { id: '4', description: 'Cartão Inter', amount: 394.00, type: 'CREDIT', category: 'Cartão de Crédito', consolidated: false, cardName: 'Cartão Inter' },
  { id: '5', description: 'Cartão Credicard', amount: 164.00, type: 'CREDIT', category: 'Cartão de Crédito', consolidated: false, cardName: 'Cartão Credicard' },
  { id: '6', description: 'Cartão Digio', amount: 140.00, type: 'CREDIT', category: 'Cartão de Crédito', consolidated: false, cardName: 'Cartão Digio' },
  { id: '7', description: 'Cartão Mercado Livre', amount: 87.17, type: 'CREDIT', category: 'Cartão de Crédito', consolidated: false, cardName: 'Cartão Mercado Livre' },
  { id: '8', description: 'Aluguel', amount: 550.00, type: 'EXPENSE', category: 'Moradia', consolidated: true, accountName: 'Conta Principal (Nubank)' },
  { id: '9', description: 'Shalom Escola', amount: 500.00, type: 'EXPENSE', category: 'Educação', consolidated: true, accountName: 'Conta Principal (Nubank)' },
  { id: '10', description: 'Plano de Saúde', amount: 400.00, type: 'EXPENSE', category: 'Saúde', consolidated: true, accountName: 'Conta Principal (Nubank)' },
  { id: '11', description: 'Dízimo', amount: 280.00, type: 'EXPENSE', category: 'Doações', consolidated: true, accountName: 'Conta Principal (Nubank)' },
  { id: '12', description: 'Faculdade', amount: 110.00, type: 'EXPENSE', category: 'Educação', consolidated: true, accountName: 'Conta Principal (Nubank)' },
  { id: '13', description: 'Celular Crédito', amount: 50.00, type: 'EXPENSE', category: 'Telefonia', consolidated: true, accountName: 'Conta Principal (Nubank)' },
];

export const INITIAL_CREDIT_CARDS: CreditCardItem[] = [
  { id: 'card-1', name: 'Cartão Neon', brand: 'Neon', limit: 1500, closingDay: 15, dueDay: 22, color: 'from-cyan-500/20 to-teal-500/10', border: 'border-cyan-500/30', badge: 'text-cyan-400' },
  { id: 'card-2', name: 'Cartão Inter', brand: 'Inter', limit: 2000, closingDay: 10, dueDay: 17, color: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/30', badge: 'text-orange-400' },
  { id: 'card-3', name: 'Cartão Credicard', brand: 'Credicard', limit: 1200, closingDay: 5, dueDay: 12, color: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/30', badge: 'text-blue-400' },
  { id: 'card-4', name: 'Cartão Digio', brand: 'Digio', limit: 1000, closingDay: 20, dueDay: 27, color: 'from-sky-500/20 to-blue-500/10', border: 'border-sky-500/30', badge: 'text-sky-400' },
  { id: 'card-5', name: 'Cartão Mercado Livre', brand: 'Mercado Livre', limit: 800, closingDay: 1, dueDay: 8, color: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/30', badge: 'text-yellow-400' },
];

export const KNOWN_CREDIT_CARDS = INITIAL_CREDIT_CARDS;

export const INITIAL_ACCOUNTS: AccountItem[] = [
  { id: 'acc-1', name: 'Conta Principal (Nubank)', bank: 'Nubank', type: 'CHECKING', balance: 3250.00, color: 'purple', icon: 'wallet' },
  { id: 'acc-2', name: 'Reserva de Emergência', bank: 'Inter / CDB', type: 'SAVINGS', balance: 5000.00, color: 'emerald', icon: 'shield' },
  { id: 'acc-3', name: 'Carteira Dinheiro', bank: 'Espécie', type: 'CASH', balance: 150.00, color: 'amber', icon: 'banknote' },
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Renda', type: 'INCOME', color: 'emerald' },
  { id: 'cat-2', name: 'Renda Extra', type: 'INCOME', color: 'teal' },
  { id: 'cat-3', name: 'Cartão de Crédito', type: 'EXPENSE', color: 'purple' },
  { id: 'cat-4', name: 'Moradia', type: 'EXPENSE', color: 'blue', budget: 1200 },
  { id: 'cat-5', name: 'Educação', type: 'EXPENSE', color: 'indigo', budget: 700 },
  { id: 'cat-6', name: 'Saúde', type: 'EXPENSE', color: 'rose', budget: 500 },
  { id: 'cat-7', name: 'Doações', type: 'EXPENSE', color: 'sky', budget: 300 },
  { id: 'cat-8', name: 'Telefonia', type: 'EXPENSE', color: 'cyan', budget: 100 },
  { id: 'cat-9', name: 'Alimentação', type: 'EXPENSE', color: 'amber', budget: 800 },
  { id: 'cat-10', name: 'Transporte', type: 'EXPENSE', color: 'orange', budget: 400 },
  { id: 'cat-11', name: 'Lazer', type: 'EXPENSE', color: 'pink', budget: 300 },
  { id: 'cat-12', name: 'Assinaturas', type: 'EXPENSE', color: 'violet', budget: 150 },
  { id: 'cat-13', name: 'Vestuário', type: 'EXPENSE', color: 'fuchsia', budget: 200 },
  { id: 'cat-14', name: 'Investimentos', type: 'BOTH', color: 'emerald', budget: 500 },
];

export const COMMON_CATEGORIES = INITIAL_CATEGORIES.map(c => c.name);
