import React, { useState } from 'react';
import { AlertTriangle, TrendingDown, ChevronDown, ChevronUp, Lightbulb, Sparkles } from 'lucide-react';
import { formatMoney } from '../utils/formatters';

interface BudgetHealthAlertProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalCreditCards: number;
  isDark?: boolean;
}

export const BudgetHealthAlert: React.FC<BudgetHealthAlertProps> = ({
  totalIncome,
  totalExpenses,
  netBalance,
  totalCreditCards,
  isDark = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (netBalance >= 0) {
    return null;
  }

  const deficit = Math.abs(netBalance);
  const cardShare = totalExpenses > 0 ? (totalCreditCards / totalExpenses) * 100 : 0;

  return (
    <div className={`rounded-xl p-4 text-xs no-print transition-all border ${
      isDark 
        ? 'bg-amber-950/20 border-amber-800/40 text-amber-200' 
        : 'bg-amber-50/90 border-amber-200 text-amber-900 shadow-xs'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
            isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className={`font-semibold text-sm flex items-center gap-2 flex-wrap ${
              isDark ? 'text-amber-300' : 'text-amber-950 font-bold'
            }`}>
              Atenção ao Orçamento de Novembro 2026
              <span className={`font-mono text-xs px-2 py-0.5 rounded border font-bold ${
                isDark 
                  ? 'bg-rose-950/60 text-rose-300 border-rose-800/50' 
                  : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}>
                Déficit de {formatMoney(deficit)}
              </span>
            </div>
            <p className={`mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-amber-900/90'}`}>
              As despesas totais ({formatMoney(totalExpenses)}) superam a receita ({formatMoney(totalIncome)}). Os 5 cartões de crédito representam {cardShare.toFixed(1)}% do orçamento total ({formatMoney(totalCreditCards)}).
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 shrink-0 font-medium cursor-pointer ${
            isDark 
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' 
              : 'text-amber-800 hover:text-amber-950 hover:bg-amber-100/70'
          }`}
        >
          <span>{expanded ? 'Ocultar Dicas' : 'Ver Dicas'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className={`mt-4 pt-3 border-t grid grid-cols-1 md:grid-cols-3 gap-3 ${
          isDark ? 'border-amber-900/40' : 'border-amber-200'
        }`}>
          <div className={`p-3 rounded-lg border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-amber-200/80 shadow-2xs'
          }`}>
            <div className="font-medium text-amber-700 flex items-center gap-1.5 mb-1">
              <Lightbulb className="w-3.5 h-3.5" />
              Priorizar Faturas
            </div>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Considere pagar as faturas com maiores juros primeiro ou renegociar despesas parceladas para evitar o rotativo.
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-amber-200/80 shadow-2xs'
          }`}>
            <div className="font-medium text-amber-700 flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              Despesas Não-Essenciais
            </div>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Revise categorias flexíveis para cortar temporariamente cerca de {formatMoney(deficit / 2)} e aliviar o fluxo de caixa.
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-amber-200/80 shadow-2xs'
          }`}>
            <div className="font-medium text-emerald-700 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Renda Extra
            </div>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Um acréscimo pontual em renda extra semelhante ao IBE pode ajudar a fechar a diferença até o próximo mês.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
