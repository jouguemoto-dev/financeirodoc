import React, { useState, useEffect } from 'react';
import { X, Calendar, Repeat, Check, Plus, CreditCard, Landmark, Tag, Trash2 } from 'lucide-react';
import { Transaction, TransactionType, CategoryItem, CreditCardItem, AccountItem } from '../types';
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
    cardName?: string;
    accountId?: string;
    accountName?: string;
    repeat?: {
      frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
      occurrences: number;
    };
  }) => void;
  onDelete?: (id: string) => void;
  editingTransaction: Transaction | null;
  categories?: CategoryItem[];
  cards?: CreditCardItem[];
  accounts?: AccountItem[];
  onOpenNewCategory?: () => void;
  onOpenNewCard?: () => void;
  onOpenNewAccount?: () => void;
  isDark?: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingTransaction,
  categories = [],
  cards = [],
  accounts = [],
  onOpenNewCategory,
  onOpenNewCard,
  onOpenNewAccount,
  isDark = false,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState('');
  const [cardName, setCardName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [consolidated, setConsolidated] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [frequency, setFrequency] = useState<'MONTHLY' | 'WEEKLY' | 'YEARLY'>('MONTHLY');
  const [occurrences, setOccurrences] = useState(12);

  // Lista mesclada de categorias
  const categoryOptions = categories.length > 0 
    ? categories.map((c) => c.name) 
    : COMMON_CATEGORIES;

  // Lista de cartões disponíveis
  const cardOptions = cards.length > 0 
    ? cards.map((c) => c.name) 
    : ['Cartão Neon', 'Cartão Inter', 'Cartão Credicard', 'Cartão Digio', 'Cartão Mercado Livre'];

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setCardName(editingTransaction.cardName || '');
      setAccountId(editingTransaction.accountId || '');
      setConsolidated(editingTransaction.consolidated);
      setIsRepeating(false);
    } else {
      setDescription('');
      setAmount('');
      setType('EXPENSE');
      setCategory(categoryOptions[0] || 'Alimentação');
      setCardName(cardOptions[0] || 'Cartão Neon');
      setAccountId(accounts.length > 0 ? accounts[0].id : '');
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

    const selectedAccountObj = accounts.find((a) => a.id === accountId);

    onSave({
      id: editingTransaction ? editingTransaction.id : undefined,
      description: description.trim(),
      amount: numAmount,
      type,
      category: category.trim() || 'Geral',
      consolidated,
      cardName: type === 'CREDIT' ? (cardName.trim() || undefined) : undefined,
      accountId: accountId || undefined,
      accountName: selectedAccountObj ? selectedAccountObj.name : undefined,
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
          {/* Descrição */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Descrição do Lançamento *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Salário, Aluguel, Supermercado..."
              className={`w-full border rounded-xl px-3.5 py-2 text-sm transition-colors focus:outline-none ${inputClass}`}
            />
          </div>

          {/* Valor e Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Valor (R$) *
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
                className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono transition-colors focus:outline-none ${inputClass}`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Natureza *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className={`w-full border rounded-xl px-3.5 py-2 text-sm transition-colors focus:outline-none cursor-pointer ${inputClass}`}
              >
                <option value="EXPENSE">Despesa (Gasto)</option>
                <option value="INCOME">Receita (Ganho)</option>
                <option value="CREDIT">Cartão de Crédito</option>
              </select>
            </div>
          </div>

          {/* Seletor de Cartão de Crédito (se type === 'CREDIT') */}
          {type === 'CREDIT' && (
            <div className="p-3 rounded-xl border border-amber-300/40 bg-amber-500/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cartão de Crédito *</span>
                </label>
                {onOpenNewCard && (
                  <button
                    type="button"
                    onClick={onOpenNewCard}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Novo Cartão</span>
                  </button>
                )}
              </div>
              <select
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-sm ${inputClass}`}
              >
                {cardOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Seletor de Conta Bancária / Carteira */}
          {accounts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Landmark className="w-3.5 h-3.5 text-blue-500" />
                  <span>Conta / Carteira</span>
                </label>
                {onOpenNewAccount && (
                  <button
                    type="button"
                    onClick={onOpenNewAccount}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Nova Conta</span>
                  </button>
                )}
              </div>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2 text-sm transition-colors focus:outline-none cursor-pointer ${inputClass}`}
              >
                <option value="">Nenhuma / Não vincular</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.bank || 'Conta'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Categoria com botão inline de + Nova Categoria */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                <span>Categoria *</span>
              </label>
              {onOpenNewCategory && (
                <button
                  type="button"
                  onClick={onOpenNewCategory}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Nova Categoria</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Moradia, Alimentação, Educação..."
                className={`w-full border rounded-xl px-3.5 py-2 text-sm transition-colors focus:outline-none ${inputClass}`}
              />
            </div>

            {/* Sugestões rápidas de categoria cadastradas */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {categoryOptions.slice(0, 8).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                    category === c
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : isDark 
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
                <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Repeat className="w-3.5 h-3.5 text-slate-400" />
                  Repetir este lançamento (recorrente)
                </span>
              </label>

              {isRepeating && (
                <div className={`grid grid-cols-2 gap-3 pl-6 p-3 rounded-xl border ${
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
              <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Marcar como Consolidado / Já Pago
              </span>
            </label>
          </div>

          {/* Footer Ações */}
          <div className={`flex items-center justify-between gap-2 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {editingTransaction && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingTransaction.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                title="Excluir este lançamento"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                  isDark 
                    ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700' 
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingTransaction ? 'Atualizar' : 'Salvar Lançamento'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
