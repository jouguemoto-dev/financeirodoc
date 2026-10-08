import React, { useState, useEffect } from 'react';
import { X, CreditCard, Sparkles, Check, Trash2, Calendar, DollarSign } from 'lucide-react';
import { CreditCardItem } from '../types';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: {
    id?: string;
    name: string;
    brand: string;
    limit?: number;
    closingDay?: number;
    dueDay?: number;
    color?: string;
    border?: string;
    badge?: string;
    initialInvoiceAmount?: number;
  }) => void;
  onDelete?: (id: string) => void;
  editingCard?: CreditCardItem | null;
  isDark?: boolean;
}

const COLOR_PRESETS = [
  { name: 'Ciano (Neon / Digital)', color: 'from-cyan-500/20 to-teal-500/10', border: 'border-cyan-500/30', badge: 'text-cyan-400', preview: 'bg-cyan-500' },
  { name: 'Laranja (Inter / C6)', color: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/30', badge: 'text-orange-400', preview: 'bg-orange-500' },
  { name: 'Roxo (Nubank)', color: 'from-purple-500/20 to-indigo-500/10', border: 'border-purple-500/30', badge: 'text-purple-400', preview: 'bg-purple-600' },
  { name: 'Azul (Credicard / Caixa)', color: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/30', badge: 'text-blue-400', preview: 'bg-blue-600' },
  { name: 'Céu (Digio)', color: 'from-sky-500/20 to-blue-500/10', border: 'border-sky-500/30', badge: 'text-sky-400', preview: 'bg-sky-500' },
  { name: 'Dourado (Mercado Livre / Ouro)', color: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/30', badge: 'text-yellow-400', preview: 'bg-yellow-500' },
  { name: 'Esmeralda (Verde / Sicredi)', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30', badge: 'text-emerald-400', preview: 'bg-emerald-500' },
  { name: 'Vermelho (Santander / Bradesco)', color: 'from-rose-500/20 to-red-500/10', border: 'border-rose-500/30', badge: 'text-rose-400', preview: 'bg-rose-500' },
  { name: 'Preto / Grafite (Black / Infinite)', color: 'from-slate-700/40 to-slate-900', border: 'border-slate-600', badge: 'text-slate-300', preview: 'bg-slate-800' },
];

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingCard,
  isDark = false,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Mastercard');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [initialInvoice, setInitialInvoice] = useState('');

  useEffect(() => {
    if (editingCard) {
      setName(editingCard.name);
      setBrand(editingCard.brand || 'Mastercard');
      setLimit(editingCard.limit ? editingCard.limit.toString() : '');
      setClosingDay(editingCard.closingDay ? editingCard.closingDay.toString() : '');
      setDueDay(editingCard.dueDay ? editingCard.dueDay.toString() : '');
      setInitialInvoice('');

      // Achar preset que coincide ou default
      const foundIdx = COLOR_PRESETS.findIndex((p) => p.color === editingCard.color);
      setSelectedPresetIndex(foundIdx >= 0 ? foundIdx : 0);
    } else {
      setName('');
      setBrand('Nubank');
      setLimit('2000');
      setClosingDay('10');
      setDueDay('17');
      setSelectedPresetIndex(2); // Nubank roxo como padrão amigável
      setInitialInvoice('0');
    }
  }, [editingCard, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const chosenPreset = COLOR_PRESETS[selectedPresetIndex];
    const numLimit = limit ? parseFloat(limit.replace(',', '.')) : undefined;
    const numClosing = closingDay ? parseInt(closingDay, 10) : undefined;
    const numDue = dueDay ? parseInt(dueDay, 10) : undefined;
    const numInitialInvoice = initialInvoice ? parseFloat(initialInvoice.replace(',', '.')) : undefined;

    onSave({
      id: editingCard ? editingCard.id : undefined,
      name: name.trim().startsWith('Cartão ') ? name.trim() : `Cartão ${name.trim()}`,
      brand: brand.trim() || 'Mastercard',
      limit: numLimit && !isNaN(numLimit) ? numLimit : undefined,
      closingDay: numClosing && !isNaN(numClosing) ? Math.min(31, Math.max(1, numClosing)) : undefined,
      dueDay: numDue && !isNaN(numDue) ? Math.min(31, Math.max(1, numDue)) : undefined,
      color: chosenPreset.color,
      border: chosenPreset.border,
      badge: chosenPreset.badge,
      initialInvoiceAmount: !editingCard && numInitialInvoice && !isNaN(numInitialInvoice) && numInitialInvoice > 0 ? numInitialInvoice : undefined,
    });

    onClose();
  };

  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-amber-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs no-print">
      <div 
        className={`border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[94vh] flex flex-col transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header do Modal */}
        <div className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingCard ? 'Editar Cartão de Crédito' : 'Criar Novo Cartão de Crédito'}
              </h3>
              <p className="text-xs text-slate-500">
                Gerencie limites, dias de vencimento e faturas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Nome do Cartão */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Nome do Cartão *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ex: Nubank, C6 Carbon, Itaú Click, Inter Gold"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-hidden font-medium transition-all ${inputClass}`}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Dica: O prefixo "Cartão" é adicionado automaticamente se não for inserido.
            </p>
          </div>

          {/* Bandeira / Instituição */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Bandeira / Banco
              </label>
              <input
                type="text"
                placeholder="Ex: Mastercard, Visa, Nubank"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-hidden font-medium transition-all ${inputClass}`}
              />
            </div>

            {/* Limite de Crédito */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Limite Total (R$)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 3500,00"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-hidden font-mono font-medium transition-all ${inputClass}`}
                />
              </div>
            </div>
          </div>

          {/* Dias de Fechamento e Vencimento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Dia Fechamento
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Dia (1 a 31)"
                value={closingDay}
                onChange={(e) => setClosingDay(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-hidden font-mono font-medium transition-all ${inputClass}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Dia Vencimento
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Dia (1 a 31)"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-hidden font-mono font-medium transition-all ${inputClass}`}
              />
            </div>
          </div>

          {/* Fatura Inicial Opcional (apenas na criação) */}
          {!editingCard && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Fatura Atual deste Mês (R$) <span className="normal-case text-[11px] font-normal text-slate-400">(opcional)</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 350,00 (0 para zerada)"
                value={initialInvoice}
                onChange={(e) => setInitialInvoice(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-hidden font-mono font-medium transition-all ${inputClass}`}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Se informado, criará automaticamente o lançamento de fatura para a competência ativa.
              </p>
            </div>
          )}

          {/* Cor e Tema do Cartão */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Cor e Estilo do Cartão
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {COLOR_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setSelectedPresetIndex(idx)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                    selectedPresetIndex === idx
                      ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5'
                      : isDark
                      ? 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                  title={preset.name}
                >
                  <div className={`w-6 h-6 rounded-lg ${preset.preview} shadow-2xs flex items-center justify-center`}>
                    {selectedPresetIndex === idx && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-[10px] truncate max-w-full font-medium text-slate-500">
                    {preset.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prévia do Cartão */}
          <div className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Pré-visualização
            </span>
            <div className={`p-3 rounded-lg bg-gradient-to-br ${COLOR_PRESETS[selectedPresetIndex].color} border ${COLOR_PRESETS[selectedPresetIndex].border} flex items-center justify-between`}>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight block">
                  {name ? (name.startsWith('Cartão ') ? name : `Cartão ${name}`) : 'Cartão Exemplo'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {brand || 'Mastercard'} • Limite: R$ {limit || '0,00'}
                </span>
              </div>
              <CreditCard className={`w-5 h-5 ${COLOR_PRESETS[selectedPresetIndex].badge}`} />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {editingCard && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Deseja realmente excluir o ${editingCard.name}?`)) {
                    onDelete(editingCard.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{editingCard ? 'Salvar Alterações' : 'Criar Cartão'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
