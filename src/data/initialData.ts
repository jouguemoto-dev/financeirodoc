import { Transaction } from '../types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Salário', amount: 2700.00, type: 'INCOME', category: 'Renda', consolidated: true },
  { id: '2', description: 'IBE', amount: 87.17, type: 'INCOME', category: 'Renda Extra', consolidated: true },
  { id: '3', description: 'Cartão Neon', amount: 527.00, type: 'CREDIT', category: 'Cartão de Crédito', consolidated: false, cardName: 'Cartão Neon' },
  { id: '4', description: 'Cartão Inter', amount: 394.00, type: 'CREDIT', category: 'Cartão de Crédito', consolidated: false, cardName: 'Cartão Inter' },
  { id: '5', description: 'Cartão Credicard', amount: 164.00, type: 'CREDIT', category: 'Cartão de Crédito', consolidated: false, cardName: 'Cartão Credicard' },
  { id: '6', description: 'Cartão Digio', amount: 140.00, type: 'CREDIT', category: 'Cartão de Crédito', consolidated: false, cardName: 'Cartão Digio' },
  { id: '7', description: 'Cartão Mercado Livre', amount: 87.17, type: 'CREDIT', category: 'Cartão de Crédito', consolidated: false, cardName: 'Cartão Mercado Livre' },
  { id: '8', description: 'Aluguel', amount: 550.00, type: 'EXPENSE', category: 'Moradia', consolidated: true },
  { id: '9', description: 'Shalom Escola', amount: 500.00, type: 'EXPENSE', category: 'Educação', consolidated: true },
  { id: '10', description: 'Plano de Saúde', amount: 400.00, type: 'EXPENSE', category: 'Saúde', consolidated: true },
  { id: '11', description: 'Dízimo', amount: 280.00, type: 'EXPENSE', category: 'Doações', consolidated: true },
  { id: '12', description: 'Faculdade', amount: 110.00, type: 'EXPENSE', category: 'Educação', consolidated: true },
  { id: '13', description: 'Celular Crédito', amount: 50.00, type: 'EXPENSE', category: 'Telefonia', consolidated: true },
];

export const KNOWN_CREDIT_CARDS = [
  { name: 'Cartão Neon', brand: 'Neon', color: 'from-cyan-500/20 to-teal-500/10', border: 'border-cyan-500/30', badge: 'text-cyan-400' },
  { name: 'Cartão Inter', brand: 'Inter', color: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/30', badge: 'text-orange-400' },
  { name: 'Cartão Credicard', brand: 'Credicard', color: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/30', badge: 'text-blue-400' },
  { name: 'Cartão Digio', brand: 'Digio', color: 'from-sky-500/20 to-blue-500/10', border: 'border-sky-500/30', badge: 'text-sky-400' },
  { name: 'Cartão Mercado Livre', brand: 'Mercado Livre', color: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/30', badge: 'text-yellow-400' },
];

export const COMMON_CATEGORIES = [
  'Renda',
  'Renda Extra',
  'Cartão de Crédito',
  'Moradia',
  'Educação',
  'Saúde',
  'Doações',
  'Telefonia',
  'Alimentação',
  'Transporte',
  'Lazer',
  'Assinaturas',
  'Vestuário',
  'Investimentos',
];
