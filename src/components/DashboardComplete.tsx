import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  PieChart, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  PiggyBank,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Transaction } from '../types';
import { formatMoney } from '../utils/formatters';

interface DashboardCompleteProps {
  transactions: Transaction[];
  currentMonth: string;
  spendingLimit: number;
  onOpenCardInvoice: (card: Transaction) => void;
  onToggleStatus: (id: string) => void;
  isDark?: boolean;
}

export const DashboardComplete: React.FC<DashboardCompleteProps> = ({
  transactions,
  currentMonth,
  spendingLimit,
  onOpenCardInvoice,
  onToggleStatus,
  isDark = false,
}) => {
  // Cálculos consolidados do Dashboard
  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalCredit = 0;
    let totalFixedExpenses = 0;
    let paidTotal = 0;
    let pendingTotal = 0;

    const categoryMap: Record<string, { amount: number; count: number }> = {};
    const cardBreakdown: { id: string; name: string; amount: number; consolidated: boolean; rawTx: Transaction }[] = [];

    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
      } else {
        totalExpenses += tx.amount;
        if (tx.type === 'CREDIT') {
          totalCredit += tx.amount;
          cardBreakdown.push({
            id: tx.id,
            name: tx.description,
            amount: tx.amount,
            consolidated: tx.consolidated,
            rawTx: tx,
          });
        } else {
          totalFixedExpenses += tx.amount;
        }

        // Categoria
        const cat = tx.category || 'Geral';
        if (!categoryMap[cat]) categoryMap[cat] = { amount: 0, count: 0 };
        categoryMap[cat].amount += tx.amount;
        categoryMap[cat].count += 1;

        // Pagos vs Pendentes
        if (tx.consolidated) {
          paidTotal += tx.amount;
        } else {
          pendingTotal += tx.amount;
        }
      }
    });

    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 && netBalance > 0 ? (netBalance / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    // Pontuação de Saúde Financeira (0 a 100)
    let healthScore = 100;
    if (expenseRatio > 100) {
      healthScore = Math.max(20, Math.round(100 - (expenseRatio - 100) * 2));
    } else if (expenseRatio > 85) {
      healthScore = Math.round(70 - (expenseRatio - 85) * 2);
    } else {
      healthScore = Math.min(100, Math.round(80 + (100 - expenseRatio) * 0.2));
    }

    // Top 5 maiores despesas
    const topExpenses = [...transactions]
      .filter((t) => t.type !== 'INCOME')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Contas pendentes
    const pendingBills = [...transactions]
      .filter((t) => t.type !== 'INCOME' && !t.consolidated)
      .sort((a, b) => b.amount - a.amount);

    // Categorias ordenadas
    const sortedCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
        percent: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      }));

    return {
      totalIncome,
      totalExpenses,
      totalCredit,
      totalFixedExpenses,
      netBalance,
      savingsRate,
      expenseRatio,
      healthScore,
      paidTotal,
      pendingTotal,
      topExpenses,
      pendingBills,
      sortedCategories,
      cardBreakdown,
    };
  }, [transactions]);

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-800 shadow-xs';

  const categoryPalette = [
    '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', 
    '#10b981', '#06b6d4', '#f97316', '#6366f1', '#64748b'
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Header do Dashboard Executivo com Saúde Financeira */}
      <div className={`${cardBg} border rounded-2xl p-5 lg:p-6 transition-colors`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold tracking-tight">
                Painel Executivo Financeiro • {currentMonth}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Visão consolidada do fluxo de caixa, cartões de crédito e saúde orçamentária do cliente.
            </p>
          </div>

          {/* Termômetro de Saúde Financeira */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-4 ${
            metrics.healthScore >= 75
              ? (isDark ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/80 border-emerald-200')
              : metrics.healthScore >= 50
              ? (isDark ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50/80 border-amber-200')
              : (isDark ? 'bg-rose-950/20 border-rose-800/40' : 'bg-rose-50/80 border-rose-200')
          }`}>
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">
                Score Financeiro
              </span>
              <span className={`text-2xl font-mono font-extrabold ${
                metrics.healthScore >= 75 ? 'text-emerald-600' : metrics.healthScore >= 50 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {metrics.healthScore}/100
              </span>
            </div>

            <div className="w-px h-8 bg-slate-300 dark:bg-slate-700" />

            <div className="text-xs space-y-0.5">
              <span className="font-bold block">
                {metrics.healthScore >= 75 ? 'Excelente Equilíbrio' : metrics.healthScore >= 50 ? 'Atenção ao Orçamento' : 'Déficit no Período'}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {metrics.expenseRatio.toFixed(0)}% da renda comprometida
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso do Orçamento (Comprometimento da Renda) */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-semibold">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Comprometimento da Renda Mensal
            </span>
            <span className={`font-mono font-bold ${
              metrics.expenseRatio > 100 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {metrics.expenseRatio.toFixed(1)}% ({formatMoney(metrics.totalExpenses)} de {formatMoney(metrics.totalIncome)})
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
            {/* Despesas Fixas */}
            <div 
              style={{ width: `${Math.min(100, (metrics.totalFixedExpenses / (metrics.totalIncome || 1)) * 100)}%` }}
              className="bg-blue-500 h-full transition-all"
              title={`Despesas Fixas: ${formatMoney(metrics.totalFixedExpenses)}`}
            />
            {/* Cartões de Crédito */}
            <div 
              style={{ width: `${Math.min(100, (metrics.totalCredit / (metrics.totalIncome || 1)) * 100)}%` }}
              className="bg-amber-500 h-full transition-all"
              title={`Faturas de Cartões: ${formatMoney(metrics.totalCredit)}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] text-slate-500 pt-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Despesas Fixas ({metrics.totalIncome > 0 ? ((metrics.totalFixedExpenses / metrics.totalIncome) * 100).toFixed(0) : 0}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Faturas dos Cartões ({metrics.totalIncome > 0 ? ((metrics.totalCredit / metrics.totalIncome) * 100).toFixed(0) : 0}%)</span>
            </div>
            {metrics.netBalance > 0 && (
              <div className="flex items-center gap-1.5 text-emerald-600 font-medium sm:ml-auto">
                <PiggyBank className="w-3.5 h-3.5" />
                <span>Sobra Disponível: {formatMoney(metrics.netBalance)} ({metrics.savingsRate.toFixed(0)}%)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Grid de 4 KPIs Estratégicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Receita Total */}
        <div className={`${cardBg} border rounded-xl p-5`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Receita do Mês</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(metrics.totalIncome)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Salário + Rendas Extras
          </span>
        </div>

        {/* Despesas Totais */}
        <div className={`${cardBg} border rounded-xl p-5`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Despesas Totais</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatMoney(metrics.totalExpenses)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {metrics.totalIncome > 0 ? `${metrics.expenseRatio.toFixed(1)}% da receita` : 'Despesas gerais'}
          </span>
        </div>

        {/* Faturas de Cartões */}
        <div className={`${cardBg} border rounded-xl p-5`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Total dos Cartões</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatMoney(metrics.totalCredit)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {metrics.cardBreakdown.length} cartões cadastrados
          </span>
        </div>

        {/* Saldo Líquido */}
        <div className={`${cardBg} border rounded-xl p-5`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Saldo Líquido</span>
            <div className={`p-1.5 rounded-lg ${
              metrics.netBalance >= 0 
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-2 font-mono text-2xl font-bold ${
            metrics.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatMoney(metrics.netBalance)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {metrics.netBalance >= 0 ? 'Sobra líquida em caixa' : 'Déficit orçamentário'}
          </span>
        </div>
      </div>

      {/* 3. Painel de Status de Liquidação (Pago vs Pendente) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contas Pagas / Consolidadas */}
        <div className={`${cardBg} border rounded-xl p-4.5 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Total Já Pago</span>
              <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatMoney(metrics.paidTotal)}
              </div>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            {metrics.totalExpenses > 0 ? ((metrics.paidTotal / metrics.totalExpenses) * 100).toFixed(0) : 0}% liquidado
          </span>
        </div>

        {/* Contas Pendentes de Pagamento */}
        <div className={`${cardBg} border rounded-xl p-4.5 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">A Pagar no Mês</span>
              <div className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400">
                {formatMoney(metrics.pendingTotal)}
              </div>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            {metrics.pendingBills.length} itens a vencer
          </span>
        </div>
      </div>

      {/* 4. Visão Analítica de Faturas & Top Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Faturas de Cartões com Acesso Rápido */}
        <div className={`${cardBg} border rounded-2xl p-5 space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm">Faturas de Cartões de Crédito</h3>
            </div>
            <span className="text-xs text-slate-500">
              Clique para abrir e pagar
            </span>
          </div>

          <div className="space-y-2.5">
            {metrics.cardBreakdown.map((card) => (
              <div
                key={card.id}
                onClick={() => onOpenCardInvoice(card.rawTx)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer hover:-translate-y-0.5 ${
                  card.consolidated
                    ? (isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/80 border-slate-200')
                    : (isDark ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50/60 border-amber-200')
                }`}
                title="Clique para abrir fatura, pagar ou alterar valor"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    card.consolidated 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  }`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">{card.name}</span>
                    <span className="text-[11px] text-slate-500">
                      Fatura de {currentMonth}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm">
                    {formatMoney(card.amount)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    card.consolidated
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                  }`}>
                    {card.consolidated ? 'Paga' : 'Pendente'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Maiores Despesas do Mês */}
        <div className={`${cardBg} border rounded-2xl p-5 space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-sm">Top 5 Maiores Despesas</h3>
            </div>
            <span className="text-xs text-slate-500">
              Impacto no orçamento
            </span>
          </div>

          <div className="space-y-2.5">
            {metrics.topExpenses.map((expense, idx) => (
              <div 
                key={expense.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-xs block">{expense.description}</span>
                    <span className="text-[11px] text-slate-500">{expense.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400 block">
                    {formatMoney(expense.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {metrics.totalExpenses > 0 ? ((expense.amount / metrics.totalExpenses) * 100).toFixed(1) : 0}% do total
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Distribuição por Categorias */}
      <div className={`${cardBg} border rounded-2xl p-5 space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm">Distribuição de Gastos por Categoria</h3>
          </div>
          <span className="text-xs text-slate-500">
            {metrics.sortedCategories.length} categorias ativas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {metrics.sortedCategories.map((cat, idx) => (
            <div 
              key={cat.name} 
              className={`p-3.5 rounded-xl border space-y-2 ${
                isDark ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold truncate max-w-[150px]">{cat.name}</span>
                <span className="font-mono font-semibold">{formatMoney(cat.amount)}</span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, cat.percent)}%`,
                    backgroundColor: categoryPalette[idx % categoryPalette.length]
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{cat.count} {cat.count === 1 ? 'item' : 'itens'}</span>
                <span>{cat.percent.toFixed(1)}% do orçamento</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
