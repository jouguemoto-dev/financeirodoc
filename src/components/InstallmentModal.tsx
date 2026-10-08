import React, { useState } from 'react';
import { X, CreditCard, Calculator } from 'lucide-react';
import { KNOWN_CREDIT_CARDS } from '../data/initialData';
import { formatMoney } from '../utils/formatters';

interface InstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCard?: string;
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
  onSave,
  isDark = false,
}) => {
  const [description, setDescription] = useState('');
  const [cardName, setCardName] = useState(defaultCard || 'Cartão Neon');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [installmentsCount, setInstallmentsCount] = useState<number>(10);
  const [category, setCategory] = useState('Compras / Parcelado');
  const [addToCurrentInvoice, setAddToCurrentInvoice] = useState(true);

  if (!isOpen) return null;

  const numTotal = parseFloat(totalAmount.replace(',', '.')) || 0;
  const singleInstallment = installmentsCount > 0 ? numTotal / installmentsCount : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numTotal <= 0 || installmentsCount <= 1) return;

    onSave({
      description: description.trim(),
      cardName,
      totalAmount: numTotal,
      installmentsCount,
      installmentAmount: parseFloat(singleInstallment.toFixed(2)),
      category: category.trim() || 'Compras / Parcelado',
      addToCurrentInvoice,
    });

    onClose();
  };

  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-amber-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
      <div 
        className={`border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header do Modal */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Nova Compra Parcelada
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              {KNOWN_CREDIT_CARDS.map((card) => (
                <option key={card.name} value={card.name}>
                  {card.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
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
              <input
                type="number"
                min="2"
                max="48"
                required
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(parseInt(e.target.value) || 2)}
                className={`w-full border rounded-lg px-3 py-2 text-sm font-mono transition-colors focus:outline-none ${inputClass}`}
              />
            </div>
          </div>

          {/* Cálculo e Resumo do Parcelamento em Tempo Real */}
          {numTotal > 0 && installmentsCount > 0 && (
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-amber-50/70 border-amber-200'
            }`}>
              <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-amber-800'}`}>
                <Calculator className="w-4 h-4 text-amber-600" />
                <span>Valor de cada parcela:</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-amber-600 text-sm tabular-nums">
                  {installmentsCount}x de {formatMoney(singleInstallment)}
                </span>
                <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-amber-700/80'}`}>
                  Total: {formatMoney(numTotal)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Categoria
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
                Adicionar 1ª parcela à fatura atual deste mês (+{formatMoney(singleInstallment)})
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
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Gerar {installmentsCount} Parcelas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
