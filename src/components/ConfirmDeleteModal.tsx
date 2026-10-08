import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Transaction } from '../types';
import { formatMoney } from '../utils/formatters';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction?: Transaction | null;
  count?: number; // for bulk delete
  customTitle?: string;
  customDescription?: string;
  isDark?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  count,
  customTitle,
  customDescription,
  isDark = false,
}) => {
  if (!isOpen) return null;

  const isBulk = typeof count === 'number' && count > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        role="alertdialog"
        aria-modal="true"
      >
        {/* Header com Ícone de Alerta */}
        <div className={`flex items-start justify-between p-5 border-b ${
          isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-rose-50/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800/60">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {customTitle || (isBulk ? 'Excluir Vários Lançamentos' : 'Excluir Lançamento')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Confirmação de exclusão permanente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com detalhes do item */}
        <div className="p-5 space-y-4">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {customDescription ? (
              customDescription
            ) : isBulk ? (
              <>
                Você tem certeza que deseja excluir permanentemente os{' '}
                <strong className="text-rose-600 dark:text-rose-400 font-bold">{count} lançamentos</strong> selecionados?
              </>
            ) : (
              <>
                Você tem certeza que deseja excluir o lançamento abaixo?
              </>
            )}
          </p>

          {/* Card com prévia do lançamento individual */}
          {!isBulk && transaction && (
            <div className={`p-3.5 rounded-xl border space-y-2 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-semibold text-sm block truncate">
                    {transaction.description}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-medium text-[11px]">
                      {transaction.category}
                    </span>
                    <span>•</span>
                    <span>
                      {transaction.type === 'INCOME' && 'Receita'}
                      {transaction.type === 'EXPENSE' && 'Despesa Fixa'}
                      {transaction.type === 'CREDIT' && 'Cartão de Crédito'}
                    </span>
                    {transaction.cardName && (
                      <>
                        <span>•</span>
                        <span>{transaction.cardName}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-mono font-bold text-base ${
                    transaction.type === 'INCOME'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatMoney(transaction.amount)}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    {transaction.consolidated ? 'Pago / Consolidado' : 'Pendente'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300">
            ⚠️ <strong>Atenção:</strong> Esta ação não poderá ser desfeita. O saldo e as estatísticas serão recalculados automaticamente.
          </div>
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className={`p-4 border-t flex items-center justify-end gap-2.5 ${
          isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/60'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
            }`}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isBulk ? `Excluir ${count} Lançamentos` : 'Sim, Excluir'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
