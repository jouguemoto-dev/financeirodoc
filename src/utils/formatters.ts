import { Transaction } from '../types';

export const formatMoney = (val: number): string => {
  return val.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatCurrency = formatMoney;

export const exportTransactionsToCSV = (transactions: Transaction[], filename = 'controle_financeiro_novembro_2026.csv') => {
  const headers = ['ID', 'Descrição', 'Valor (R$)', 'Tipo', 'Categoria', 'Status', 'Cartão'];
  
  const typeMap: Record<string, string> = {
    INCOME: 'Receita',
    EXPENSE: 'Despesa Fixa',
    CREDIT: 'Cartão de Crédito',
  };

  const rows = transactions.map((t) => [
    t.id,
    `"${t.description.replace(/"/g, '""')}"`,
    t.amount.toFixed(2).replace('.', ','),
    typeMap[t.type] || t.type,
    `"${t.category.replace(/"/g, '""')}"`,
    t.consolidated ? 'Consolidado' : 'Pendente',
    t.cardName ? `"${t.cardName.replace(/"/g, '""')}"` : '',
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
