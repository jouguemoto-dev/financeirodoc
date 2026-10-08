import React, { useState } from 'react';
import { PieChart, BarChart3 } from 'lucide-react';
import { Transaction } from '../types';
import { formatMoney } from '../utils/formatters';

interface FinancialChartsProps {
  transactions: Transaction[];
  isDark?: boolean;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ 
  transactions,
  isDark = false 
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Categorias de despesas (não-receitas)
  const categoryTotals: Record<string, number> = {};
  let totalExpenses = 0;

  transactions
    .filter((t) => t.type !== 'INCOME')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      totalExpenses += t.amount;
    });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const categoryColors: Record<string, string> = {
    'Cartão de Crédito': '#f59e0b',
    'Moradia': '#3b82f6',
    'Educação': '#8b5cf6',
    'Saúde': '#ec4899',
    'Doações': '#10b981',
    'Telefonia': '#06b6d4',
    'Alimentação': '#f97316',
    'Transporte': '#6366f1',
    'Lazer': '#14b8a6',
  };

  const defaultPalette = ['#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#06b6d4', '#f97316', '#6366f1'];

  // Dados para Donut Chart SVG
  let cumulativeAngle = 0;
  const slices = sortedCategories.map(([category, amount], idx) => {
    const fraction = totalExpenses > 0 ? amount / totalExpenses : 0;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const color = categoryColors[category] || defaultPalette[idx % defaultPalette.length];
    return {
      category,
      amount,
      fraction,
      startAngle,
      angle,
      color,
    };
  });

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, innerRadius: number, startAngle: number, endAngle: number) => {
    const effectiveEnd = endAngle - startAngle >= 359.99 ? startAngle + 359.99 : endAngle;
    const start = polarToCartesian(x, y, radius, effectiveEnd);
    const end = polarToCartesian(x, y, radius, startAngle);
    const startInner = polarToCartesian(x, y, innerRadius, startAngle);
    const endInner = polarToCartesian(x, y, innerRadius, effectiveEnd);

    const largeArcFlag = effectiveEnd - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'L', startInner.x, startInner.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, endInner.x, endInner.y,
      'Z',
    ].join(' ');
  };

  // Balanço: Receitas vs Despesas
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const maxBalance = Math.max(totalIncome, totalExpenses, 1);
  const incomeWidth = (totalIncome / maxBalance) * 100;
  const expenseWidth = (totalExpenses / maxBalance) * 100;
  const netDiff = totalIncome - totalExpenses;

  // Detalhe de cartões vs despesas fixas
  const creditCardsTotal = transactions
    .filter((t) => t.type === 'CREDIT')
    .reduce((acc, t) => acc + t.amount, 0);

  const fixedExpensesTotal = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const cardBg = isDark
    ? 'bg-slate-900/90 border-slate-800'
    : 'bg-white border-slate-200/90 shadow-xs';

  const headingText = isDark ? 'text-slate-200' : 'text-slate-800';
  const subtext = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderDivider = isDark ? 'border-slate-800/80' : 'border-slate-100';

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
      {/* Gráfico 1: Despesas por Categoria */}
      <div className={`${cardBg} border rounded-xl p-5 flex flex-col justify-between transition-colors duration-200`}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold flex items-center gap-2 ${headingText}`}>
              <PieChart className="w-4 h-4 text-emerald-600" />
              Distribuição de Despesas por Categoria
            </h3>
            <span className={`text-xs font-mono tabular-nums ${subtext}`}>
              Total: {formatMoney(totalExpenses)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            {/* SVG Donut */}
            <div className="relative w-48 h-48 shrink-0">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {slices.length === 0 ? (
                  <circle cx="100" cy="100" r="80" fill="none" stroke={isDark ? '#334155' : '#e2e8f0'} strokeWidth="30" />
                ) : (
                  slices.map((slice, i) => {
                    const isHovered = hoveredCategory === slice.category;
                    return (
                      <path
                        key={i}
                        d={describeArc(100, 100, isHovered ? 86 : 80, 52, slice.startAngle, slice.startAngle + slice.angle)}
                        fill={slice.color}
                        className="transition-all duration-200 cursor-pointer opacity-90 hover:opacity-100"
                        onMouseEnter={() => setHoveredCategory(slice.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    );
                  })
                )}
              </svg>
              {/* Centro do Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className={`text-[10px] uppercase tracking-wider font-medium ${subtext}`}>
                  {hoveredCategory || 'Despesas'}
                </span>
                <span className={`font-mono text-xs font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {hoveredCategory
                    ? formatMoney(categoryTotals[hoveredCategory] || 0)
                    : `${slices.length} Cat.`}
                </span>
              </div>
            </div>

            {/* Legenda Customizada com Valores e Percentuais */}
            <div className="w-full space-y-1.5 overflow-y-auto max-h-48 pr-1 text-xs">
              {slices.map((slice) => {
                const isHovered = hoveredCategory === slice.category;
                const pct = (slice.fraction * 100).toFixed(1);
                return (
                  <div
                    key={slice.category}
                    onMouseEnter={() => setHoveredCategory(slice.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isHovered 
                        ? (isDark ? 'bg-slate-800' : 'bg-slate-100') 
                        : (isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50')
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className={`truncate font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {slice.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className={`font-semibold tabular-nums ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                        {formatMoney(slice.amount)}
                      </span>
                      <span className={`text-[11px] w-11 text-right tabular-nums ${subtext}`}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`mt-4 pt-3 border-t text-[11px] flex items-center justify-between ${borderDivider} ${subtext}`}>
          <span>Maior categoria: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{sortedCategories[0]?.[0] || 'Nenhuma'}</strong></span>
          <span className="font-mono tabular-nums">{sortedCategories[0] ? formatMoney(sortedCategories[0][1]) : ''}</span>
        </div>
      </div>

      {/* Gráfico 2: Balanço e Composição (Receitas vs Despesas) */}
      <div className={`${cardBg} border rounded-xl p-5 flex flex-col justify-between transition-colors duration-200`}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold flex items-center gap-2 ${headingText}`}>
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Balanço: Receitas vs. Despesas
            </h3>
            <span className={`text-xs font-mono font-bold tabular-nums ${
              netDiff >= 0 
                ? (isDark ? 'text-emerald-400' : 'text-emerald-600') 
                : (isDark ? 'text-rose-400' : 'text-rose-600')
            }`}>
              {netDiff >= 0 ? `+${formatMoney(netDiff)}` : formatMoney(netDiff)}
            </span>
          </div>

          <div className="space-y-4 py-2">
            {/* Barra de Receitas */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className={`font-medium flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Receitas do Mês
                </span>
                <span className={`font-mono font-bold tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {formatMoney(totalIncome)}
                </span>
              </div>
              <div className={`h-6 w-full rounded-lg overflow-hidden flex items-center px-2 ${
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}>
                <div
                  className="h-full bg-emerald-500 rounded-md transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(incomeWidth, 5)}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-white">
                    {totalIncome > 0 ? '100%' : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Despesas */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className={`font-medium flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Despesas do Mês (Fixas + Cartões)
                </span>
                <span className={`font-mono font-bold tabular-nums ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                  {formatMoney(totalExpenses)}
                </span>
              </div>
              <div className={`h-6 w-full rounded-lg overflow-hidden flex items-center px-2 ${
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}>
                <div
                  className="h-full bg-rose-500 rounded-md transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(expenseWidth, 5)}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-white">
                    {totalIncome > 0 ? `${((totalExpenses / totalIncome) * 100).toFixed(0)}%` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Decomposição das Despesas: Cartões vs Fixas */}
            <div className={`mt-4 pt-3 border-t ${borderDivider}`}>
              <span className={`text-xs font-medium block mb-2 ${subtext}`}>Composição dos Gastos:</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className={`p-2.5 rounded-lg border ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-[11px] mb-1 ${subtext}`}>Cartões de Crédito</div>
                  <div className={`font-mono font-bold text-sm tabular-nums ${
                    isDark ? 'text-amber-400' : 'text-amber-600'
                  }`}>
                    {formatMoney(creditCardsTotal)}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${subtext}`}>
                    {totalExpenses > 0 ? `${((creditCardsTotal / totalExpenses) * 100).toFixed(1)}% dos gastos` : '0%'}
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-[11px] mb-1 ${subtext}`}>Despesas Fixas</div>
                  <div className={`font-mono font-bold text-sm tabular-nums ${
                    isDark ? 'text-rose-400' : 'text-rose-600'
                  }`}>
                    {formatMoney(fixedExpensesTotal)}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${subtext}`}>
                    {totalExpenses > 0 ? `${((fixedExpensesTotal / totalExpenses) * 100).toFixed(1)}% dos gastos` : '0%'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-4 pt-3 border-t text-[11px] flex items-center justify-between ${borderDivider} ${subtext}`}>
          <span>Situação do mês:</span>
          <span className={`font-semibold ${
            netDiff >= 0 
              ? (isDark ? 'text-emerald-400' : 'text-emerald-600') 
              : (isDark ? 'text-rose-400' : 'text-rose-600')
          }`}>
            {netDiff >= 0 ? 'Equilibrado / Sobrando' : 'Alerta de Déficit (-R$ ' + Math.abs(netDiff).toFixed(2).replace('.', ',') + ')'}
          </span>
        </div>
      </div>
    </section>
  );
};
