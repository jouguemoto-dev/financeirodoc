import React, { useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  CreditCard, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  RotateCcw,
  Check,
  MessageSquareQuote,
  AlertTriangle
} from 'lucide-react';
import { Transaction, FilterType, FilterStatus } from '../types';
import { formatMoney } from '../utils/formatters';

interface TransactionTableProps {
  transactions: Transaction[];
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: FilterType;
  onTypeFilterChange: (val: FilterType) => void;
  statusFilter: FilterStatus;
  onStatusFilterChange: (val: FilterStatus) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
  allCategories: string[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string, checked: boolean) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleConsolidated: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onBulkConsolidated: (consolidated: boolean) => void;
  onBulkDelete: () => void;
  onRemoveDuplicates?: () => void;
  onOpenTransactionModal: () => void;
  onOpenInstallmentModal: () => void;
  onOpenChat?: () => void;
  onClearFilters: () => void;
  isDark?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  allCategories,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onToggleConsolidated,
  onEditTransaction,
  onDeleteTransaction,
  onBulkConsolidated,
  onBulkDelete,
  onRemoveDuplicates,
  onOpenTransactionModal,
  onOpenInstallmentModal,
  onOpenChat,
  onClearFilters,
  isDark = false,
}) => {
  const isAllSelected = transactions.length > 0 && transactions.every((t) => selectedIds.has(t.id));

  // Identificar lançamentos repetidos (mesma descrição, valor, tipo e cartão)
  const duplicateCount = useMemo(() => {
    const seen = new Set<string>();
    let count = 0;
    transactions.forEach((tx) => {
      const key = `${tx.description.toLowerCase().trim()}_${tx.amount}_${tx.type}_${tx.cardName || ''}`;
      if (seen.has(key)) {
        count += 1;
      } else {
        seen.add(key);
      }
    });
    return count;
  }, [transactions]);

  const cardBg = isDark
    ? 'bg-slate-900/90 border-slate-800'
    : 'bg-white border-slate-200/90 shadow-xs';

  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500 shadow-2xs';

  return (
    <section className={`${cardBg} border rounded-xl p-5 space-y-5 card-print transition-colors duration-200`}>
      {/* Header com Título e Botões de Criação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-base font-bold print-text-dark ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Lançamentos Financeiros
          </h2>
          <p className={`text-xs print-text-muted mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Gerencie receitas, despesas fixas e lançamentos de cartão de crédito.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 no-print w-full sm:w-auto">
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className={`flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
              title="Lançamento Rápido por Chat Grátis"
            >
              <MessageSquareQuote className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Lançar por Chat</span>
              <span className="px-1 py-0.2 text-[9px] font-black rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                Grátis
              </span>
            </button>
          )}

          <button
            onClick={onOpenInstallmentModal}
            className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>+ Compra Parcelada</span>
          </button>

          <button
            onClick={onOpenTransactionModal}
            className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Controles e Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        {/* Campo de Busca */}
        <div className="relative">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por descrição ou categoria..."
            className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs transition-colors focus:outline-none ${inputClass}`}
          />
        </div>

        {/* Filtro por Tipo */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as FilterType)}
            className={`w-full border rounded-lg px-3 py-2 text-xs transition-colors focus:outline-none cursor-pointer ${inputClass}`}
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Despesas Fixas</option>
            <option value="CREDIT">Cartões de Crédito</option>
          </select>
        </div>

        {/* Filtro por Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as FilterStatus)}
            className={`w-full border rounded-lg px-3 py-2 text-xs transition-colors focus:outline-none cursor-pointer ${inputClass}`}
          >
            <option value="ALL">Todos os Status</option>
            <option value="CONSOLIDATED">Consolidados / Pagos</option>
            <option value="PENDING">Pendentes</option>
          </select>
        </div>

        {/* Filtro por Categoria ou Limpar */}
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-xs transition-colors focus:outline-none cursor-pointer ${inputClass}`}
          >
            <option value="ALL">Todas as Categorias</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(search || typeFilter !== 'ALL' || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <button
              onClick={onClearFilters}
              className={`px-2.5 py-2 text-xs rounded-lg transition-colors shrink-0 cursor-pointer ${
                isDark 
                  ? 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700' 
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
              }`}
              title="Limpar todos os filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Barra de Ações em Massa */}
      {selectedIds.size > 0 && (
        <div className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg no-print border ${
          isDark 
            ? 'bg-slate-950/90 border-slate-800 text-slate-300' 
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-emerald-600 font-mono tabular-nums">
              {selectedIds.size}
            </span>
            <span>{selectedIds.size === 1 ? 'item selecionado' : 'itens selecionados'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkConsolidated(true)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                isDark 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Marcar Consolidado</span>
            </button>

            <button
              onClick={() => onBulkConsolidated(false)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                isDark 
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20' 
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Marcar Pendente</span>
            </button>

            <button
              onClick={onBulkDelete}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                isDark 
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20' 
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Selecionados</span>
            </button>
          </div>
        </div>
      )}

      {/* Alerta de Lançamentos Repetidos / Duplicados */}
      {duplicateCount > 0 && (
        <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print ${
          isDark 
            ? 'bg-amber-950/30 border-amber-800/50 text-amber-200' 
            : 'bg-amber-50 border-amber-200 text-amber-900 shadow-2xs'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block">
                {duplicateCount} {duplicateCount === 1 ? 'lançamento repetido detectado' : 'lançamentos repetidos detectados'}
              </span>
              <span className="text-[11px] text-amber-700/90 dark:text-amber-300/80">
                Encontramos transações idênticas em seu extrato. Você pode limpar as cópias extras com 1 clique.
              </span>
            </div>
          </div>
          {onRemoveDuplicates && (
            <button
              onClick={onRemoveDuplicates}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 active:scale-95 text-white shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
              title="Remover lançamentos repetidos mantendo 1 original"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Repetidos ({duplicateCount})</span>
            </button>
          )}
        </div>
      )}

      {/* Versão Otimizada para Smartphone / Telas Mobile */}
      <div className="md:hidden space-y-2.5 no-print">
        {transactions.length === 0 ? (
          <div className={`p-8 text-center rounded-xl border ${
            isDark ? 'border-slate-800 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}>
            <Filter className="w-6 h-6 mx-auto mb-2 text-slate-400" />
            <p className="font-semibold text-xs">
              {search || typeFilter !== 'ALL' || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                ? 'Nenhum lançamento encontrado para os filtros.'
                : 'Nenhum lançamento cadastrado.'}
            </p>
            <button
              onClick={onOpenTransactionModal}
              className="mt-3 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Lançamento</span>
            </button>
          </div>
        ) : (
          transactions.map((t) => {
            const isSelected = selectedIds.has(t.id);
            const isIncome = t.type === 'INCOME';

            return (
              <div
                key={`mobile-${t.id}`}
                className={`p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? (isDark ? 'bg-slate-800/80 border-emerald-500/50' : 'bg-emerald-50/70 border-emerald-300')
                    : (isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs')
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onToggleSelect(t.id, e.target.checked)}
                      className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                      title="Selecionar"
                    />
                    <div className="min-w-0">
                      <span className={`font-semibold text-xs leading-snug block truncate ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      }`}>
                        {t.description}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          isIncome
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : t.type === 'CREDIT'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                        }`}>
                          {t.category}
                        </span>
                        {t.installmentInfo && (
                          <span className={`text-[10px] font-mono px-1 py-0.2 rounded border ${
                            isDark 
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800/50' 
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {t.installmentInfo.current}/{t.installmentInfo.total}
                          </span>
                        )}
                        {t.cardName && t.type === 'CREDIT' && (
                          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            · {t.cardName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-mono font-bold text-sm block tabular-nums ${
                      isIncome 
                        ? (isDark ? 'text-emerald-400' : 'text-emerald-600') 
                        : (isDark ? 'text-rose-400' : 'text-rose-600')
                    }`}>
                      {isIncome ? '+' : '-'}{formatMoney(t.amount)}
                    </span>
                  </div>
                </div>

                {/* Linha Inferior com Botão de Status e Ações */}
                <div className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 ${
                  isDark ? 'border-slate-800/80' : 'border-slate-100'
                }`}>
                  <button
                    onClick={() => onToggleConsolidated(t.id)}
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      t.consolidated
                        ? (isDark 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200')
                        : (isDark 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                            : 'bg-amber-50 text-amber-800 border-amber-200')
                    }`}
                  >
                    {t.consolidated ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pago</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pendente</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditTransaction(t)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                        isDark 
                          ? 'text-slate-200 bg-slate-800/90 hover:bg-slate-700 border-slate-700' 
                          : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200'
                      }`}
                      title="Editar lançamento"
                      aria-label="Editar lançamento"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => onDeleteTransaction(t.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                        isDark 
                          ? 'text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/50' 
                          : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                      }`}
                      title="Excluir lançamento"
                      aria-label="Excluir lançamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tabela de Lançamentos (Visão Desktop e Tablet) */}
      <div className={`hidden md:block overflow-x-auto rounded-lg border ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <table className={`w-full text-left text-xs ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          <thead className={`uppercase tracking-wider font-semibold border-b ${
            isDark 
              ? 'bg-slate-950 text-slate-400 border-slate-800' 
              : 'bg-slate-100/80 text-slate-600 border-slate-200'
          }`}>
            <tr>
              <th className="p-3 w-10 text-center no-print">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                  title="Selecionar todos"
                />
              </th>
              <th className="p-3">Descrição</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Tipo</th>
              <th className="p-3 text-right">Valor</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center no-print w-24">Ações</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDark 
              ? 'divide-slate-800/60 bg-slate-900/40' 
              : 'divide-slate-100 bg-white'
          }`}>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className={`p-10 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Filter className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {search || typeFilter !== 'ALL' || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                          ? 'Nenhum lançamento encontrado para os filtros selecionados.'
                          : 'Seu extrato está zerado (R$ 0,00).'}
                      </p>
                      <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {search || typeFilter !== 'ALL' || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                          ? 'Tente ajustar os filtros ou termo de busca acima.'
                          : 'Adicione suas receitas e despesas reais para começar seu controle.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-1 no-print">
                      {search || typeFilter !== 'ALL' || statusFilter !== 'ALL' || categoryFilter !== 'ALL' ? (
                        <button
                          onClick={onClearFilters}
                          className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                            isDark 
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          Limpar filtros
                        </button>
                      ) : (
                        <button
                          onClick={onOpenTransactionModal}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Primeiro Lançamento</span>
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((t) => {
                const isSelected = selectedIds.has(t.id);
                const isIncome = t.type === 'INCOME';

                return (
                  <tr
                    key={t.id}
                    className={`transition-colors ${
                      isSelected 
                        ? (isDark ? 'bg-slate-800/60' : 'bg-emerald-50/60') 
                        : (isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80')
                    }`}
                  >
                    <td className="p-3 text-center no-print">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onToggleSelect(t.id, e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    <td className={`p-3 font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{t.description}</span>
                        {t.installmentInfo && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            isDark 
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800/50' 
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {t.installmentInfo.current}/{t.installmentInfo.total}
                          </span>
                        )}
                        {t.cardName && t.type === 'CREDIT' && (
                          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            · {t.cardName}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="text-xs">
                        {t.category}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="text-xs">
                        {t.type === 'INCOME' && 'Receita'}
                        {t.type === 'EXPENSE' && 'Despesa Fixa'}
                        {t.type === 'CREDIT' && 'Cartão de Crédito'}
                      </span>
                    </td>

                    <td
                      className={`p-3 text-right font-mono font-bold tabular-nums text-sm ${
                        isIncome 
                          ? (isDark ? 'text-emerald-400' : 'text-emerald-600') 
                          : (isDark ? 'text-rose-400' : 'text-rose-600')
                      }`}
                    >
                      {formatMoney(t.amount)}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => onToggleConsolidated(t.id)}
                        type="button"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer border ${
                          t.consolidated
                            ? (isDark 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100')
                            : (isDark 
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20' 
                                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100')
                        }`}
                        title="Clique para alternar o status"
                      >
                        {t.consolidated ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Consolidado</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pendente</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="p-3 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditTransaction(t)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                            isDark 
                              ? 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border-slate-700' 
                              : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
                          }`}
                          title="Editar lançamento"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span className="hidden lg:inline">Editar</span>
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(t.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                            isDark 
                              ? 'text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/50' 
                              : 'text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border-rose-200'
                          }`}
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">Excluir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className={`flex items-center justify-between text-xs pt-1 ${
        isDark ? 'text-slate-500' : 'text-slate-500'
      }`}>
        <span>Mostrando {transactions.length} lançamento(s)</span>
        <span className="font-mono tabular-nums">
          Subtotal exibido: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{formatMoney(transactions.reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0))}</strong>
        </span>
      </div>
    </section>
  );
};
