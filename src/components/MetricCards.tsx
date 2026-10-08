import React from 'react';
import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '../utils/formatters';

interface MetricCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalCreditCards: number;
  consolidatedExpenses: number;
  pendingExpenses: number;
  isDark?: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalIncome,
  totalExpenses,
  netBalance,
  totalCreditCards,
  consolidatedExpenses,
  pendingExpenses,
  isDark = false,
}) => {
  const isPositive = netBalance >= 0;
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const cardBg = isDark
    ? 'bg-slate-900/90 border-slate-800'
    : 'bg-white border-slate-200/90 shadow-xs';

  const subtext = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Total */}
        <div className={`${cardBg} border rounded-xl p-5 card-print transition-colors duration-200`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${subtext}`}>
              Receita Total
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-3 font-mono text-2xl lg:text-3xl font-bold tracking-tight tabular-nums ${
            isDark ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            {formatMoney(totalIncome)}
          </div>
          <p className={`mt-1 text-xs ${subtext}`}>
            Salário + Renda Extra
          </p>
        </div>

        {/* Despesas Totais */}
        <div className={`${cardBg} border rounded-xl p-5 card-print transition-colors duration-200`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${subtext}`}>
              Despesas Totais
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'
            }`}>
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-3 font-mono text-2xl lg:text-3xl font-bold tracking-tight tabular-nums ${
            isDark ? 'text-rose-400' : 'text-rose-600'
          }`}>
            {formatMoney(totalExpenses)}
          </div>
          <p className={`mt-1 text-xs ${subtext}`}>
            Despesas Fixas + Faturas
          </p>
        </div>

        {/* Saldo Líquido do Mês */}
        <div className={`${cardBg} border rounded-xl p-5 card-print transition-colors duration-200`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${subtext}`}>
              Saldo do Mês
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isPositive 
                ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                : (isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600')
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-3 font-mono text-2xl lg:text-3xl font-bold tracking-tight tabular-nums ${
            isPositive 
              ? (isDark ? 'text-emerald-400' : 'text-emerald-600') 
              : (isDark ? 'text-rose-400' : 'text-rose-600')
          }`}>
            {formatMoney(netBalance)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {isPositive ? (
              <span className={`flex items-center gap-1 font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Superávit financeiro
              </span>
            ) : (
              <span className={`flex items-center gap-1 font-medium ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                <AlertCircle className="w-3.5 h-3.5" />
                Déficit orçamentário
              </span>
            )}
          </div>
        </div>

        {/* Cartões de Crédito */}
        <div className={`${cardBg} border rounded-xl p-5 card-print transition-colors duration-200`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${subtext}`}>
              Cartões de Crédito
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'
            }`}>
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-3 font-mono text-2xl lg:text-3xl font-bold tracking-tight tabular-nums ${
            isDark ? 'text-amber-400' : 'text-amber-600'
          }`}>
            {formatMoney(totalCreditCards)}
          </div>
          <p className={`mt-1 text-xs ${subtext}`}>
            Total em 5 faturas
          </p>
        </div>
      </div>

      {/* Barra de Status Consolidado vs Pendente */}
      <div className={`${cardBg} border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 card-print transition-colors duration-200`}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
          <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className={subtext}>Pagos / Consolidados: </span>
            <span className={`font-mono font-semibold tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              {formatMoney(consolidatedExpenses)}
            </span>
          </div>
          <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>|</span>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></div>
          <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className={subtext}>Pendentes no Mês: </span>
            <span className={`font-mono font-semibold tabular-nums ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {formatMoney(pendingExpenses)}
            </span>
          </div>
        </div>

        <div className={`flex items-center gap-2 text-xs ${subtext}`}>
          <span>Comprometimento da Renda:</span>
          <span className={`font-mono font-bold tabular-nums ${
            expenseRatio > 100 
              ? (isDark ? 'text-rose-400' : 'text-rose-600') 
              : (isDark ? 'text-slate-200' : 'text-slate-800')
          }`}>
            {expenseRatio.toFixed(1)}%
          </span>
          <div className={`w-24 h-2 rounded-full overflow-hidden shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div 
              className={`h-full rounded-full transition-all duration-300 ${expenseRatio > 100 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(expenseRatio, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
