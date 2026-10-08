import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cloud, 
  CreditCard, 
  Lock, 
  ArrowRight, 
  UserCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

interface LoginScreenProps {
  onLoginGoogle: () => Promise<void>;
  onContinueAsGuest: () => void;
  isLoading?: boolean;
  isDark?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginGoogle,
  onContinueAsGuest,
  isLoading = false,
  isDark = false,
}) => {
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleClick = async () => {
    try {
      setLoadingLogin(true);
      setErrorMessage(null);
      await onLoginGoogle();
    } catch (err: any) {
      console.error('Erro no login:', err);
      setErrorMessage(
        'Não foi possível concluir o login com o Google. Se estiver usando bloqueador de pop-ups, permita pop-ups para este site.'
      );
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background glow effects suaves */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand / Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md ring-1 ring-black/5 mb-1">
            <span className="font-bold text-2xl tracking-tight">R$</span>
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Controle Financeiro Pessoal
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Users className="w-3.5 h-3.5" />
            <span>Login Individual por Cliente</span>
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Cada cliente possui sua própria conta, extrato e cartões protegidos.
          </p>
        </div>

        {/* Card Principal de Login Individual */}
        <div className={`border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="space-y-1.5 text-center">
            <h2 className={`text-base font-bold flex items-center justify-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Acesso à Sua Conta Individual</span>
            </h2>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Faça login com seu Google para acessar seus dados confidenciais ou criar sua nova conta com extrato limpo.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* Botão de Login Google */}
          <button
            onClick={handleGoogleClick}
            disabled={loadingLogin || isLoading}
            className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 font-semibold text-sm rounded-xl transition-all shadow-xs hover:shadow-md disabled:opacity-60 cursor-pointer active:scale-[0.99] border ${
              isDark 
                ? 'bg-white hover:bg-slate-100 text-slate-900 border-transparent' 
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            {/* SVG Oficial do Google */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {loadingLogin || isLoading ? 'Autenticando...' : 'Entrar com Minha Conta Google'}
            </span>
          </button>

          {/* Destaques de Segurança e Individualidade */}
          <div className={`pt-2 border-t space-y-2.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className={`flex items-start gap-2.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Contas 100% Separadas:</strong> Os lançamentos de cada cliente ficam salvos em um banco de dados exclusivo e inacessível para outros clientes.
              </span>
            </div>

            <div className={`flex items-start gap-2.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <Cloud className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                <strong>Sincronização em Tempo Real:</strong> Acesse seu extrato em qualquer celular ou navegador sem perder dados.
              </span>
            </div>

            <div className={`flex items-start gap-2.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Opção de Zerar:</strong> Você pode começar seu controle do zero (R$ 0,00) ou restaurar o modelo base quando desejar.
              </span>
            </div>
          </div>

          {/* Divisor */}
          <div className="relative flex items-center justify-center pt-1">
            <div className={`border-t w-full ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
            <span className={`px-3 text-[11px] uppercase tracking-wider shrink-0 absolute ${
              isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'
            }`}>
              ou
            </span>
          </div>

          {/* Opção Convidado / Demonstração */}
          <div className="pt-1 text-center">
            <button
              onClick={onContinueAsGuest}
              className={`w-full py-2.5 px-4 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
                isDark 
                  ? 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border-slate-700/80' 
                  : 'text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span>Acessar em Modo Demonstração (Sem Login)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className={`text-[10px] mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Modo local temporário para visualização rápida.
            </p>
          </div>
        </div>

        {/* Rodapé Seguro */}
        <div className={`text-center text-[11px] flex items-center justify-center gap-1.5 ${
          isDark ? 'text-slate-500' : 'text-slate-500'
        }`}>
          <Lock className="w-3 h-3" />
          <span>Banco de dados Firestore com autenticação Google</span>
        </div>
      </div>
    </div>
  );
};
