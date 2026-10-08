import React from 'react';
import { 
  CalendarDays,
  Cloud,
  LogIn,
  LogOut,
  ShieldCheck,
  Settings,
  Plus,
  MessageSquareQuote
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  currentMonth: string;
  user: User | null;
  isGuest: boolean;
  isSyncing: boolean;
  isDark: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenNewTransaction?: () => void;
  onOpenChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  user,
  isGuest,
  isSyncing,
  isDark,
  onLogin,
  onLogout,
  onOpenSettings,
  onOpenNewTransaction,
  onOpenChat,
}) => {
  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || 'Cliente';
  const userPhoto = user?.photoURL;
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  return (
    <header className={`${
      isDark 
        ? 'bg-slate-900 border-slate-800 text-slate-100' 
        : 'bg-white border-slate-200 text-slate-800 shadow-xs'
    } border-b sticky top-0 z-30 no-print transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Identidade Visual & Informações do Mês */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs ring-1 ring-black/5 shrink-0">
              <span className="font-bold text-sm sm:text-lg tracking-tight">R$</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`text-sm sm:text-lg font-bold tracking-tight truncate block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Controle Financeiro
                </span>
                {user ? (
                  <span className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    isDark 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    Conta Individual
                  </span>
                ) : (
                  <span className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    isDark 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    Local
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-600 font-medium whitespace-nowrap">
                  <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {currentMonth}
                </span>
                {user && (
                  <>
                    <span aria-hidden="true" className="text-slate-400 hidden sm:inline">·</span>
                    <span className="hidden lg:inline truncate">
                      Conta de <strong className={isDark ? 'text-white' : 'text-slate-800'}>{userDisplayName}</strong>
                      {isSyncing && <span className="text-[10px] text-teal-600 ml-1.5 animate-pulse font-medium">Sincronizando...</span>}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Área de Ações: Botão Chat + Botão Novo Lançamento + Usuário + Configurações */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Botão de Lançamento por Chat 100% Grátis */}
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-xs ${
                  isDark
                    ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/60'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300'
                }`}
                title="Lançamento Rápido por Chat (100% Grátis)"
              >
                <MessageSquareQuote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                <span className="hidden sm:inline">Lançar por Chat</span>
                <span className="sm:hidden text-[11px]">Chat</span>
                <span className="px-1 py-0.2 text-[9px] font-black rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  Grátis
                </span>
              </button>
            )}

            {/* Botão de Lançamento de Transação Rápido (Desktop e Tablet) */}
            {onOpenNewTransaction && (
              <button
                onClick={onOpenNewTransaction}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                title="Novo Lançamento Financeiro"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">+ Lançamento</span>
                <span className="md:hidden">Lançar</span>
              </button>
            )}

            {/* Box do Usuário Individual Conectado */}
            {user ? (
              <div className={`flex items-center gap-1.5 sm:gap-2 ${
                isDark 
                  ? 'bg-slate-800/90 border-slate-700/80 text-slate-200' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              } border rounded-xl p-1 sm:p-1.5 sm:pr-2.5 text-xs shadow-2xs`}>
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={userDisplayName}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-emerald-500/40"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {userInitial}
                  </div>
                )}
                <div className="hidden xl:flex flex-col text-left">
                  <span className={`font-semibold text-xs leading-tight truncate max-w-[100px] ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`} title={userDisplayName}>
                    {userDisplayName}
                  </span>
                  <span className="text-[10px] text-teal-600 flex items-center gap-1 font-medium">
                    <Cloud className="w-2.5 h-2.5" />
                    <span>Nuvem ativa</span>
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                  title="Sair desta conta / Trocar de Cliente"
                  aria-label="Sair"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-xs whitespace-nowrap cursor-pointer"
                title="Fazer Login Individual com sua conta Google"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Login Individual</span>
                <span className="xs:hidden">Entrar</span>
              </button>
            )}

            {/* Botão de Configurações */}
            <button
              onClick={onOpenSettings}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700 hover:border-emerald-500/40'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 hover:border-emerald-400'
              }`}
              title="Abrir Central de Configurações, Relatórios e Opções"
              aria-label="Configurações"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden text-[11px]">Ajustes</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
