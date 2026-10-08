import React from 'react';
import { CreditCard, Check, Clock, Plus, ExternalLink, ChevronRight, FileText } from 'lucide-react';
import { Transaction } from '../types';
import { formatMoney } from '../utils/formatters';

interface CreditCardsGridProps {
  transactions: Transaction[];
  onToggleStatus: (id: string) => void;
  onFilterByCard: (cardName: string) => void;
  onOpenInstallmentForCard: (cardName: string) => void;
  onSelectCardForInvoice: (card: Transaction) => void;
  isDark?: boolean;
}

export const CreditCardsGrid: React.FC<CreditCardsGridProps> = ({
  transactions,
  onToggleStatus,
  onFilterByCard,
  onOpenInstallmentForCard,
  onSelectCardForInvoice,
  isDark = false,
}) => {
  const creditCards = transactions.filter((t) => t.type === 'CREDIT');

  const getCardStyle = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('neon')) {
      return isDark ? {
        bg: 'from-cyan-950/40 to-slate-900',
        border: 'border-cyan-800/40 hover:border-cyan-600',
        badge: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
        title: 'text-slate-200',
        amount: 'text-white',
      } : {
        bg: 'from-cyan-50/90 via-white to-white',
        border: 'border-cyan-200 hover:border-cyan-400 shadow-xs hover:shadow-md',
        badge: 'text-cyan-700 bg-cyan-100/70 border-cyan-200',
        title: 'text-cyan-950',
        amount: 'text-slate-900',
      };
    }
    if (lower.includes('inter')) {
      return isDark ? {
        bg: 'from-orange-950/40 to-slate-900',
        border: 'border-orange-800/40 hover:border-orange-600',
        badge: 'text-orange-400 bg-orange-950/60 border-orange-800/60',
        title: 'text-slate-200',
        amount: 'text-white',
      } : {
        bg: 'from-orange-50/90 via-white to-white',
        border: 'border-orange-200 hover:border-orange-400 shadow-xs hover:shadow-md',
        badge: 'text-orange-700 bg-orange-100/70 border-orange-200',
        title: 'text-orange-950',
        amount: 'text-slate-900',
      };
    }
    if (lower.includes('credicard')) {
      return isDark ? {
        bg: 'from-blue-950/40 to-slate-900',
        border: 'border-blue-800/40 hover:border-blue-600',
        badge: 'text-blue-400 bg-blue-950/60 border-blue-800/60',
        title: 'text-slate-200',
        amount: 'text-white',
      } : {
        bg: 'from-blue-50/90 via-white to-white',
        border: 'border-blue-200 hover:border-blue-400 shadow-xs hover:shadow-md',
        badge: 'text-blue-700 bg-blue-100/70 border-blue-200',
        title: 'text-blue-950',
        amount: 'text-slate-900',
      };
    }
    if (lower.includes('digio')) {
      return isDark ? {
        bg: 'from-sky-950/40 to-slate-900',
        border: 'border-sky-800/40 hover:border-sky-600',
        badge: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
        title: 'text-slate-200',
        amount: 'text-white',
      } : {
        bg: 'from-sky-50/90 via-white to-white',
        border: 'border-sky-200 hover:border-sky-400 shadow-xs hover:shadow-md',
        badge: 'text-sky-700 bg-sky-100/70 border-sky-200',
        title: 'text-sky-950',
        amount: 'text-slate-900',
      };
    }
    if (lower.includes('mercado livre') || lower.includes('meli')) {
      return isDark ? {
        bg: 'from-yellow-950/30 to-slate-900',
        border: 'border-yellow-800/40 hover:border-yellow-600',
        badge: 'text-yellow-400 bg-yellow-950/60 border-yellow-800/60',
        title: 'text-slate-200',
        amount: 'text-white',
      } : {
        bg: 'from-amber-50/90 via-white to-white',
        border: 'border-amber-200 hover:border-amber-400 shadow-xs hover:shadow-md',
        badge: 'text-amber-700 bg-amber-100/70 border-amber-200',
        title: 'text-amber-950',
        amount: 'text-slate-900',
      };
    }
    return isDark ? {
      bg: 'from-slate-800/60 to-slate-900',
      border: 'border-slate-800 hover:border-slate-600',
      badge: 'text-slate-400 bg-slate-800 border-slate-700',
      title: 'text-slate-200',
      amount: 'text-white',
    } : {
      bg: 'from-slate-50 via-white to-white',
      border: 'border-slate-200 hover:border-slate-400 shadow-xs hover:shadow-md',
      badge: 'text-slate-700 bg-slate-100 border-slate-200',
      title: 'text-slate-800',
      amount: 'text-slate-900',
    };
  };

  return (
    <section className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-sm font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}>
              Faturas dos Cartões de Crédito
            </h2>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Clique em qualquer cartão para abrir a fatura, pagar e alterar o valor
            </p>
          </div>
        </div>

        <span className={`text-xs inline-flex items-center gap-1 font-medium px-2.5 py-1 rounded-full border ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-300' 
            : 'bg-white border-slate-200 text-slate-600 shadow-2xs'
        }`}>
          <span>{creditCards.length} cartões ativos</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {creditCards.map((card) => {
          const style = getCardStyle(card.description);
          const shortName = card.description.replace('Cartão ', '');

          return (
            <div
              key={card.id}
              onClick={() => onSelectCardForInvoice(card)}
              className={`bg-gradient-to-br ${style.bg} border ${style.border} rounded-xl p-4 card-print transition-all duration-200 relative group flex flex-col justify-between cursor-pointer hover:-translate-y-0.5`}
              title="Clique para abrir a fatura completa deste cartão"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold tracking-tight uppercase ${style.title}`}>
                    {shortName}
                  </span>
                  <div className={`p-1 rounded-md ${style.badge} border group-hover:scale-110 transition-transform`}>
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className={`font-mono text-xl font-bold tracking-tight tabular-nums ${style.amount}`}>
                  {formatMoney(card.amount)}
                </div>

                {/* Tag de Ação Interativa */}
                <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold group-hover:underline">
                  <FileText className="w-3 h-3" />
                  <span>Abrir fatura & valor</span>
                  <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Status de Pagamento */}
              <div className={`pt-3 mt-3 border-t flex items-center justify-between text-xs ${
                isDark ? 'border-slate-800/80' : 'border-slate-100'
              }`}>
                <span className={`text-[11px] print-text-muted ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Fatura
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(card.id);
                  }}
                  type="button"
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    card.consolidated
                      ? (isDark 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100')
                      : (isDark
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100')
                  }`}
                  title="Clique para pagar ou reabrir esta fatura"
                >
                  {card.consolidated ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Pago</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Pendente</span>
                    </>
                  )}
                </button>
              </div>

              {/* Ações Rápidas */}
              <div 
                className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] no-print ${
                  isDark ? 'border-slate-800/40' : 'border-slate-100'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onFilterByCard(card.description)}
                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Filtrar lançamentos deste cartão no extrato"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Filtrar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenInstallmentForCard(card.description)}
                  className={`flex items-center gap-1 transition-colors font-medium cursor-pointer ${
                    isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'
                  }`}
                  title="Adicionar compra parcelada neste cartão"
                >
                  <Plus className="w-3 h-3" />
                  <span>Parcelar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
