import React, { useState, useEffect } from 'react';
import { X, Landmark, Wallet, Check, Trash2, PiggyBank, TrendingUp, Banknote } from 'lucide-react';
import { AccountItem, AccountType } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: {
    id?: string;
    name: string;
    bank?: string;
    type: AccountType;
    balance: number;
    color?: string;
  }) => void;
  onDelete?: (id: string) => void;
  editingAccount?: AccountItem | null;
  isDark?: boolean;
}

const ACCOUNT_TYPES: { type: AccountType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'CHECKING', label: 'Conta Corrente', icon: Landmark },
  { type: 'SAVINGS', label: 'Conta Poupança', icon: PiggyBank },
  { type: 'INVESTMENT', label: 'Investimentos', icon: TrendingUp },
  { type: 'CASH', label: 'Dinheiro / Carteira', icon: Banknote },
  { type: 'OTHER', label: 'Outro', icon: Wallet },
];

const COLOR_OPTIONS = [
  { name: 'Roxo (Nubank)', key: 'purple', class: 'bg-purple-600', ring: 'ring-purple-500' },
  { name: 'Laranja (Inter/Itaú)', key: 'orange', class: 'bg-orange-500', ring: 'ring-orange-500' },
  { name: 'Azul (Caixa/Bradesco)', key: 'blue', class: 'bg-blue-600', ring: 'ring-blue-500' },
  { name: 'Verde (Sicredi/Investimentos)', key: 'emerald', class: 'bg-emerald-600', ring: 'ring-emerald-500' },
  { name: 'Amarelo (BB)', key: 'amber', class: 'bg-amber-500', ring: 'ring-amber-500' },
  { name: 'Vermelho (Santander)', key: 'rose', class: 'bg-rose-600', ring: 'ring-rose-500' },
  { name: 'Ciano (Digital)', key: 'cyan', class: 'bg-cyan-500', ring: 'ring-cyan-500' },
  { name: 'Grafite (Outros)', key: 'slate', class: 'bg-slate-700', ring: 'ring-slate-500' },
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingAccount,
  isDark = false,
}) => {
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [type, setType] = useState<AccountType>('CHECKING');
  const [balance, setBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState('purple');

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setBank(editingAccount.bank || '');
      setType(editingAccount.type);
      setBalance(editingAccount.balance !== undefined ? editingAccount.balance.toString() : '0');
      setSelectedColor(editingAccount.color || 'purple');
    } else {
      setName('');
      setBank('Nubank');
      setType('CHECKING');
      setBalance('1000,00');
      setSelectedColor('purple');
    }
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numBalance = balance ? parseFloat(balance.replace(',', '.')) : 0;

    onSave({
      id: editingAccount ? editingAccount.id : undefined,
      name: name.trim(),
      bank: bank.trim() || undefined,
      type,
      balance: isNaN(numBalance) ? 0 : numBalance,
      color: selectedColor,
    });

    onClose();
  };

  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-blue-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs no-print">
      <div 
        className={`border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[94vh] flex flex-col transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingAccount ? 'Editar Conta Bancária' : 'Criar Nova Conta / Banco'}
              </h3>
              <p className="text-xs text-slate-500">
                Gerencie contas correntes, poupanças e carteiras
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
          {/* Nome da Conta */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Nome da Conta *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Nubank Principal, Itaú Corrente, Carteira Dinheiro"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-hidden font-medium transition-all ${inputClass}`}
            />
          </div>

          {/* Banco / Instituição & Saldo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Banco / Instituição
              </label>
              <input
                type="text"
                placeholder="Ex: Nubank, Itaú, Inter"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-hidden font-medium transition-all ${inputClass}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Saldo Atual (R$) *
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                placeholder="Ex: 1500,00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-hidden font-mono font-medium transition-all ${inputClass}`}
              />
            </div>
          </div>

          {/* Tipo de Conta */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Tipo de Conta
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.type;
                return (
                  <button
                    type="button"
                    key={t.type}
                    onClick={() => setType(t.type)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-2xs'
                        : isDark
                        ? 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-blue-500" />
                    <span className="text-xs truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cor de Destaque */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Cor de Destaque
            </label>
            <div className="flex flex-wrap gap-2.5 items-center">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setSelectedColor(c.key)}
                  className={`w-7 h-7 rounded-full ${c.class} transition-all flex items-center justify-center cursor-pointer ${
                    selectedColor === c.key
                      ? 'ring-3 ring-offset-2 ring-blue-500 ring-offset-white dark:ring-offset-slate-900 scale-110 shadow-xs'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  title={c.name}
                >
                  {selectedColor === c.key && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {editingAccount && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Deseja realmente excluir a conta "${editingAccount.name}"?`)) {
                    onDelete(editingAccount.id);
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
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{editingAccount ? 'Salvar Alterações' : 'Criar Conta'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
