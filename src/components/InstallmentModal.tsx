import React, { useState } from 'react';
import { X, CreditCard, Calculator } from 'lucide-react';
import { CreditCardItem, CategoryItem } from '../types';
import { KNOWN_CREDIT_CARDS } from '../data/initialData';
import { formatMoney } from '../utils/formatters';

interface InstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCard?: string;
  cards?: CreditCardItem[];
  categories?: CategoryItem[];
  onSave: (purchase: {
    description: string;
    cardName: string;
    totalAmount: number;
    installmentsCount: number;
    installmentAmount: number;
    category: string;
    addToCurrentInvoice: boolean;
  }) => void;
  isDark?: boolean;
}

export const InstallmentModal: React.FC<InstallmentModalProps> = ({
  isOpen,
  onClose,
  defaultCard,
  cards = [],
  categories = [],
  onSave,
  isDark = false,
}) => {
  const cardList = cards.length > 0 ? cards.map(c => c.name) : KNOWN_CREDIT_CARDS.map(c => c.name);

  const [description, setDescription] = useState('');
  const [cardName, setCardName] = useState(defaultCard || cardList[0] || 'Cartão Neon');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [installmentsCount, setInstallmentsCount] = useState<number>(10);
  const [category, setCategory] = useState('Compras / Parcelado');
  const [addToCurrentInvoice, setAddToCurrentInvoice] = useState(true);

  if (!isOpen) return null;

  const numTotal = parseFloat(totalAmount.replace(',', '.')) || 0;
  const singleInstallment = installmentsCount > 0 ? numTotal / installmentsCount : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numTotal <= 0) return;

    onSave({
      description: description.trim() || 'Compra Parcelada',
      cardName,
      totalAmount: numTotal,
      installmentsCount,
      installmentAmount: singleInstallment,
      category,
      addToCurrentInvoice,
    });

    onClose();
  };

  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-amber-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500';

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
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Lançar Compra Parcelada
            </h3>
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Descrição do Produto ou Serviço
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Smartphone Novo, Passagem Aérea, Notebook..."
              className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none ${inputClass}`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Cartão de Crédito
            </label>
            <select
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none cursor-pointer ${inputClass}`}
            >
              {cardList.map((cName) => (
                <option key={cName} value={cName}>
                  {cName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                inputMode="decimal"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="1200,00"
                className={`w-full border rounded-lg px-3 py-2 text-sm font-mono transition-colors focus:outline-none ${inputClass}`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Nº de Parcelas
              </label>
              <select
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(parseInt(e.target.value))}
                className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none cursor-pointer ${inputClass}`}
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24, 36, 48].map((n) => (
                  <option key={n} value={n}>
                    {n}x vezes
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cálculo do valor de cada parcela */}
          {numTotal > 0 && (
            <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
              isDark ? 'bg-amber-950/20 border-amber-800/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <span className="font-medium">Valor por Parcela:</span>
              <span className="font-mono text-sm font-bold">
                {installmentsCount}x de {formatMoney(singleInstallment)}
              </span>
            </div>
          )}

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Categoria
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Compras, Eletrônicos, Viagem..."
              className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none ${inputClass}`}
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addToCurrentInvoice}
                onChange={(e) => setAddToCurrentInvoice(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-0 cursor-pointer"
              />
              <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Incluir 1ª parcela ({formatMoney(singleInstallment)}) na fatura deste mês
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
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Confirmar Parcelamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
