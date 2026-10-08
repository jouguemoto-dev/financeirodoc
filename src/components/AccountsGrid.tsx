import React from 'react';
import { 
  Landmark, 
  Plus, 
  PiggyBank, 
  TrendingUp, 
  Banknote, 
  Wallet, 
  Edit3, 
  Trash2,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { AccountItem, AccountType } from '../types';
import { formatMoney } from '../utils/formatters';

interface AccountsGridProps {
  accounts: AccountItem[];
  onOpenNewAccount: () => void;
  onEditAccount: (account: AccountItem) => void;
  onDeleteAccount: (id: string) => void;
  isDark?: boolean;
}

export const AccountsGrid: React.FC<AccountsGridProps> = ({
  accounts,
  onOpenNewAccount,
  onEditAccount,
  onDeleteAccount,
  isDark = false,
}) => {
  const totalBalance = accounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'CHECKING':
        return Landmark;
      case 'SAVINGS':
        return PiggyBank;
      case 'INVESTMENT':
        return TrendingUp;
      case 'CASH':
        return Banknote;
      default:
        return Wallet;
    }
  };

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case 'CHECKING':
        return 'Conta Corrente';
      case 'SAVINGS':
        return 'Poupança';
      case 'INVESTMENT':
        return 'Investimentos';
      case 'CASH':
        return 'Carteira / Dinheiro';
      default:
        return 'Conta';
    }
  };

  const getColorTheme = (color?: string) => {
    switch (color) {
      case 'purple':
        return {
          bg: isDark ? 'bg-purple-950/30 border-purple-800/40' : 'bg-purple-50/80 border-purple-200',
          badge: 'text-purple-600 bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300',
          icon: 'text-purple-600 dark:text-purple-400',
        };
      case 'orange':
        return {
          bg: isDark ? 'bg-orange-950/30 border-orange-800/40' : 'bg-orange-50/80 border-orange-200',
          badge: 'text-orange-600 bg-orange-100 dark:bg-orange-950/60 dark:text-orange-300',
          icon: 'text-orange-600 dark:text-orange-400',
        };
      case 'blue':
        return {
          bg: isDark ? 'bg-blue-950/30 border-blue-800/40' : 'bg-blue-50/80 border-blue-200',
          badge: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300',
          icon: 'text-blue-600 dark:text-blue-400',
        };
      case 'emerald':
        return {
          bg: isDark ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-emerald-50/80 border-emerald-200',
          badge: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300',
          icon: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'amber':
        return {
          bg: isDark ? 'bg-amber-950/30 border-amber-800/40' : 'bg-amber-50/80 border-amber-200',
          badge: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300',
          icon: 'text-amber-600 dark:text-amber-400',
        };
      case 'rose':
        return {
          bg: isDark ? 'bg-rose-950/30 border-rose-800/40' : 'bg-rose-50/80 border-rose-200',
          badge: 'text-rose-600 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300',
          icon: 'text-rose-600 dark:text-rose-400',
        };
      case 'cyan':
        return {
          bg: isDark ? 'bg-cyan-950/30 border-cyan-800/40' : 'bg-cyan-50/80 border-cyan-200',
          badge: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-950/60 dark:text-cyan-300',
          icon: 'text-cyan-600 dark:text-cyan-400',
        };
      default:
        return {
          bg: isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs',
          badge: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
          icon: 'text-slate-600 dark:text-slate-400',
        };
    }
  };

  return (
    <section className="space-y-4">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-sm font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}>
              Contas Bancárias & Carteiras
            </h2>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Gerencie seus saldos bancários, contas correntes, poupanças e dinheiro vivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge de Saldo Total Consolidado */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
          }`}>
            <span className="text-[11px] text-slate-500">Saldo Total:</span>
            <span className={`font-mono font-bold ${
              totalBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatMoney(totalBalance)}
            </span>
          </div>

          {/* Botão de Ação: Criar Nova Conta */}
          <button
            onClick={onOpenNewAccount}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            title="Adicionar nova conta bancária ou carteira"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Conta</span>
          </button>
        </div>
      </div>

      {/* Grid de Contas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {accounts.map((acc) => {
          const theme = getColorTheme(acc.color);
          const IconComponent = getAccountIcon(acc.type);

          return (
            <div
              key={acc.id}
              className={`rounded-2xl border p-4.5 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5 ${
                theme.bg
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800 shadow-2xs ${theme.icon}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold tracking-tight ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      }`}>
                        {acc.name}
                      </h3>
                      {acc.bank && (
                        <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {acc.bank}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                    {getAccountTypeLabel(acc.type)}
                  </span>
                </div>

                {/* Saldo da Conta */}
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Saldo Disponível
                  </span>
                  <div className={`text-xl font-mono font-bold tracking-tight tabular-nums mt-0.5 ${
                    acc.balance >= 0 
                      ? (isDark ? 'text-white' : 'text-slate-900') 
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {formatMoney(acc.balance)}
                  </div>
                </div>
              </div>

              {/* Ações da Conta */}
              <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                isDark ? 'border-slate-800/80' : 'border-slate-200/80'
              }`}>
                <button
                  type="button"
                  onClick={() => onEditAccount(acc)}
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Editar dados desta conta ou ajustar saldo"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar Saldo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Deseja excluir a conta "${acc.name}"?`)) {
                      onDeleteAccount(acc.id);
                    }
                  }}
                  className="text-rose-500 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer opacity-60 group-hover:opacity-100"
                  title="Excluir conta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Card de Adição Rápida */}
        <button
          type="button"
          onClick={onOpenNewAccount}
          className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer min-h-[140px] group ${
            isDark 
              ? 'border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/10 text-slate-400 hover:text-blue-400' 
              : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-500 hover:text-blue-600'
          }`}
        >
          <div className="p-2.5 rounded-full bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">Adicionar Conta / Carteira</span>
          <span className="text-[10px] text-slate-400 text-center max-w-[180px]">
            Cadastre contas correntes, investimentos ou dinheiro físico
          </span>
        </button>
      </div>
    </section>
  );
};
