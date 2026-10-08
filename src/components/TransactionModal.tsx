import React, { useState, useEffect } from 'react';
import { X, Calendar, Repeat, Check } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { COMMON_CATEGORIES } from '../data/initialData';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: {
    id?: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    consolidated: boolean;
    repeat?: {
      frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
      occurrences: number;
    };
  }) => void;
  editingTransaction: Transaction | null;
  isDark?: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  isDark = false,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState('');
  const [consolidated, setConsolidated] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [frequency, setFrequency] = useState<'MONTHLY' | 'WEEKLY' | 'YEARLY'>('MONTHLY');
  const [occurrences, setOccurrences] = useState(12);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setConsolidated(editingTransaction.consolidated);
      setIsRepeating(false);
    } else {
      setDescription('');
      setAmount('');
      setType('EXPENSE');
      setCategory('');
      setConsolidated(false);
      setIsRepeating(false);
      setFrequency('MONTHLY');
      setOccurrences(12);
    }
  }, [editingTransaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) return;

    onSave({
      id: editingTransaction ? editingTransaction.id : undefined,
      description: description.trim(),
      amount: numAmount,
      type,
      category: category.trim() || 'Geral',
      consolidated,
      repeat: !editingTransaction && isRepeating ? { frequency, occurrences } : undefined,
    });

    onClose();
  };

  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs no-print">
      <div 
        className={`border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header do Modal */}
        <div className={`flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h3>
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Descrição
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Salário, Aluguel, Supermercado..."
              className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none ${inputClass}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className={`w-full border rounded-lg px-3 py-2 text-sm font-mono transition-colors focus:outline-none ${inputClass}`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none cursor-pointer ${inputClass}`}
              >
                <option value="INCOME">Receita</option>
                <option value="EXPENSE">Despesa Fixa</option>
                <option value="CREDIT">Cartão de Crédito</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Categoria
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Moradia, Alimentação, Educação..."
              className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none ${inputClass}`}
            />
            {/* Sugestões rápidas de categoria */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_CATEGORIES.slice(0, 6).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Repetição (Apenas para novos lançamentos) */}
          {!editingTransaction && (
            <div className={`pt-3 border-t space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRepeating}
                  onChange={(e) => setIsRepeating(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <span className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Repeat className="w-3.5 h-3.5 text-slate-400" />
                  Repetir este lançamento
                </span>
              </label>

              {isRepeating && (
                <div className={`grid grid-cols-2 gap-3 pl-6 p-3 rounded-lg border ${
                  isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Frequência
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className={`w-full border rounded-lg px-2.5 py-1.5 text-xs ${inputClass}`}
                    >
                      <option value="MONTHLY">Mensal</option>
                      <option value="WEEKLY">Semanal</option>
                      <option value="YEARLY">Anual</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Ocorrências
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={36}
                      value={occurrences}
                      onChange={(e) => setOccurrences(parseInt(e.target.value) || 2)}
                      className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-mono ${inputClass}`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Consolidado */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consolidated}
                onChange={(e) => setConsolidated(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Marcar como Consolidado / Já Pago
              </span>
            </label>
          </div>

          {/* Footer Ações */}
          <div className={`flex items-center justify-end gap-2 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                isDark 
                  ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700' 
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {editingTransaction ? 'Atualizar' : 'Salvar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
