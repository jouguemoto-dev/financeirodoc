import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Trash2, 
  RotateCcw, 
  Database, 
  Calendar, 
  Download, 
  Upload, 
  AlertTriangle, 
  Check, 
  Sun,
  Moon,
  UserCheck,
  LogOut,
  ShieldCheck,
  CreditCard,
  FileSpreadsheet,
  Printer,
  FileText,
  Cloud,
  Server,
  Globe,
  Copy,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { User } from 'firebase/auth';
import { testConnection } from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout?: () => void;
  currentMonth: string;
  onUpdateMonth: (month: string) => void;
  transactionsCount: number;
  onClearAllData: () => Promise<void> | void;
  onResetToDefault: () => Promise<void> | void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onExportBackupJSON: () => void;
  onImportBackupJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  spendingLimit: number;
  onUpdateSpendingLimit: (limit: number) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  currentMonth,
  onUpdateMonth,
  transactionsCount,
  onClearAllData,
  onResetToDefault,
  onExportPDF,
  onExportCSV,
  onExportBackupJSON,
  onImportBackupJSON,
  spendingLimit,
  onUpdateSpendingLimit,
  isDark = false,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'relatorios' | 'zerar' | 'conta' | 'firebase' | 'geral' | 'backup'>('relatorios');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [monthInput, setMonthInput] = useState(currentMonth);
  const [limitInput, setLimitInput] = useState(spendingLimit ? spendingLimit.toString() : '');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [testFirebaseStatus, setTestFirebaseStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleTestFirebase = async () => {
    setTestFirebaseStatus('testing');
    try {
      const ok = await testConnection();
      if (ok) {
        setTestFirebaseStatus('success');
      } else {
        setTestFirebaseStatus('error');
      }
    } catch {
      setTestFirebaseStatus('error');
    }
    setTimeout(() => {
      setTestFirebaseStatus('idle');
    }, 4000);
  };

  const handleCopyText = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(label);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  const handleClearConfirm = async () => {
    setIsClearing(true);
    try {
      await onClearAllData();
      setConfirmClearOpen(false);
      setSaveSuccessMessage('Todos os lançamentos foram zerados com sucesso! Saldo em R$ 0,00.');
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    } finally {
      setIsClearing(false);
    }
  };

  const handleResetConfirm = async () => {
    if (window.confirm('Tem certeza que deseja restaurar o orçamento modelo de exemplo (Novembro 2026)?')) {
      setIsResetting(true);
      try {
        await onResetToDefault();
        setSaveSuccessMessage('Modelo padrão de exemplo de Novembro 2026 restaurado!');
        setTimeout(() => setSaveSuccessMessage(null), 3500);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (monthInput.trim()) {
      onUpdateMonth(monthInput.trim());
    }
    const parsedLimit = parseFloat(limitInput.replace(',', '.'));
    onUpdateSpendingLimit(isNaN(parsedLimit) ? 0 : parsedLimit);
    setSaveSuccessMessage('Configurações salvas com sucesso!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
      <div 
        className={`border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Painel de Configurações
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Relatórios, opção de zerar, conta individual e preferências do sistema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas Superiores */}
        <div className={`flex border-b px-4 text-xs font-semibold gap-1 sm:gap-2 overflow-x-auto ${
          isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <button
            onClick={() => setActiveTab('relatorios')}
            className={`py-3 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'relatorios'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : (isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800')
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Relatórios & Exportar</span>
          </button>

          <button
            onClick={() => setActiveTab('zerar')}
            className={`py-3 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'zerar'
                ? 'border-rose-600 text-rose-600 font-bold'
                : (isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800')
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Opção de Zerar</span>
          </button>

          <button
            onClick={() => setActiveTab('conta')}
            className={`py-3 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'conta'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : (isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800')
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Conta Individual</span>
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`py-3 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'firebase'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : (isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800')
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Configuração Firebase</span>
          </button>

          <button
            onClick={() => setActiveTab('geral')}
            className={`py-3 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'geral'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : (isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800')
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Cor & Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : (isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800')
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup</span>
          </button>
        </div>

        {/* Mensagem de sucesso */}
        {saveSuccessMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{saveSuccessMessage}</span>
          </div>
        )}

        {/* Conteúdo das abas */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* ABA 1: RELATÓRIOS & EXPORTAR (Transferido da barra superior) */}
          {activeTab === 'relatorios' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>
                  Exportação & Relatórios Fiscais
                </h4>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Exporte seu demonstrativo financeiro e lançamentos consolidados para análise externa ou impressão.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Exportar PDF */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
                }`}>
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-xs">Relatório PDF</div>
                    <p className={`text-[11px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Gera relatório oficial formatado para arquivo ou compartilhamento.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onExportPDF();
                      onClose();
                    }}
                    className="mt-3 w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar PDF</span>
                  </button>
                </div>

                {/* Exportar CSV */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
                }`}>
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-xs">Planilha Excel/CSV</div>
                    <p className={`text-[11px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Planilha detalhada com todas as transações e parcelamentos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onExportCSV();
                      onClose();
                    }}
                    className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar CSV</span>
                  </button>
                </div>

                {/* Imprimir */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
                }`}>
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-xs">Imprimir Relatório</div>
                    <p className={`text-[11px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Envia o demonstrativo financeiro diretamente para a impressora.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: OPÇÃO DE ZERAR */}
          {activeTab === 'zerar' && (
            <div className="space-y-4">
              {/* Card Destaque: ZERAR DADOS */}
              <div className={`border rounded-xl p-4.5 space-y-3.5 ${
                isDark ? 'bg-rose-950/20 border-rose-800/40' : 'bg-rose-50/70 border-rose-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-600'
                  }`}>
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-bold ${isDark ? 'text-rose-300' : 'text-rose-900'}`}>
                      Zerar Todos os Lançamentos (R$ 0,00)
                    </h4>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-rose-950/80'}`}>
                      Remove todas as receitas, despesas e cartões cadastrados na sua conta, deixando o saldo limpo em <strong>R$ 0,00</strong>. Ideal para iniciar seu próprio controle financeiro do zero com seus dados reais.
                    </p>
                  </div>
                </div>

                {!confirmClearOpen ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClearOpen(true)}
                    className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Zerar Todos os Lançamentos Agora</span>
                  </button>
                ) : (
                  <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                    isDark ? 'bg-rose-950/40 border-rose-800/60' : 'bg-white border-rose-300 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Confirmar remoção de {transactionsCount} lançamentos?</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Esta ação deixará seu painel zerado com saldo em R$ 0,00.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleClearConfirm}
                        disabled={isClearing}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        {isClearing ? 'Zerando lançamentos...' : 'Sim, Zerar Tudo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClearOpen(false)}
                        className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Secundário: RESTAURAR MODELO DE EXEMPLO */}
              <div className={`border rounded-xl p-4.5 space-y-3 ${
                isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Restaurar Modelo Base de Novembro 2026
                    </h4>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Recarrega a planilha demonstrativa com o salário de R$ 2.700,00, as 5 faturas de cartões (Neon, Inter, Credicard, Digio, Mercado Livre) e as despesas fixas.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetConfirm}
                  disabled={isResetting}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 text-amber-500" />
                  <span>{isResetting ? 'Restaurando modelo...' : 'Restaurar Modelo Base (Novembro 2026)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ABA 3: CONTA INDIVIDUAL */}
          {activeTab === 'conta' && (
            <div className="space-y-4">
              <div className={`border rounded-xl p-4.5 space-y-3 ${
                isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm">Status da Conta Individual</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    user ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {user ? 'Conectado via Google' : 'Modo Demonstração'}
                  </span>
                </div>

                {user ? (
                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Nome:</span>
                      <strong className="text-slate-900">{user.displayName || 'Cliente'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">E-mail:</span>
                      <span className="font-mono text-slate-700">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">ID Único do Cliente:</span>
                      <span className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">{user.uid}</span>
                    </div>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (onLogout) {
                            onLogout();
                            onClose();
                          }
                        }}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair desta Conta / Trocar de Cliente</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 leading-relaxed">
                    Você está navegando em modo de demonstração local. Para persistir seus dados e acessá-los em múltiplos aparelhos, faça o Login Individual com sua conta Google.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ABA: CONFIGURAÇÃO FIREBASE & NUVEM */}
          {activeTab === 'firebase' && (
            <div className="space-y-4">
              {/* Header Status do Firebase */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-emerald-950'}`}>
                        Firebase Firestore & Autenticação
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Conectado
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-emerald-900/80'}`}>
                      Sincronização em tempo real de receitas, despesas e cartões na nuvem.
                    </p>
                  </div>
                </div>

                {/* Botão de Testar Conexão */}
                <button
                  type="button"
                  onClick={handleTestFirebase}
                  disabled={testFirebaseStatus === 'testing'}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs ${
                    testFirebaseStatus === 'success'
                      ? 'bg-emerald-600 text-white'
                      : testFirebaseStatus === 'error'
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  title="Testar comunicação com o servidor Firestore"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testFirebaseStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>
                    {testFirebaseStatus === 'testing' 
                      ? 'Testando...' 
                      : testFirebaseStatus === 'success' 
                      ? 'Conexão Ativa! ✓' 
                      : testFirebaseStatus === 'error'
                      ? 'Erro de Conexão'
                      : 'Testar Conexão'}
                  </span>
                </button>
              </div>

              {/* Feedback do Teste */}
              {testFirebaseStatus === 'success' && (
                <div className="p-3 bg-emerald-100/80 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span><strong>Conexão Firestore 100% Operacional!</strong> O banco de dados está respondendo normalmente às consultas e gravações.</span>
                </div>
              )}

              {/* App URL de Produção / Vercel */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-800/30 border-slate-700/80' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase block">
                      URL do Aplicativo em Produção
                    </span>
                    <a 
                      href="https://financeirodoc.vercel.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <span>https://financeirodoc.vercel.app/</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText('https://financeirodoc.vercel.app/', 'url')}
                  className="px-2 py-1 text-[11px] font-semibold border rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-600 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'url' ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              {/* Guia de Domínios Autorizados no Firebase Auth */}
              <div className={`p-4 rounded-xl border space-y-2.5 ${
                isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-amber-50/70 border-amber-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Acesso com Conta Google no Vercel (Domínio Autorizado)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    Importante
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Para que o botão <strong>"Entrar com Minha Conta Google"</strong> funcione em <strong>https://financeirodoc.vercel.app/</strong>, o domínio precisa estar adicionado em <em>Authorized Domains</em> do Firebase:
                </p>
                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-amber-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5 font-sans">
                  <p className="font-semibold text-slate-900 dark:text-white">Passo a passo no Console do Firebase:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Entre no <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold">Firebase Console</a> e selecione o projeto <strong>gen-lang-client-0329505371</strong>.</li>
                    <li>No menu lateral, clique em <strong>Build &gt; Authentication</strong> (Autenticação).</li>
                    <li>Clique na aba <strong>Settings</strong> (Configurações) e selecione <strong>Authorized domains</strong> (Domínios autorizados).</li>
                    <li>Clique no botão <strong>Add domain</strong> (Adicionar domínio) e digite:
                      <div className="mt-1 flex items-center gap-2">
                        <code className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs text-indigo-600 dark:text-indigo-400">
                          financeirodoc.vercel.app
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopyText('financeirodoc.vercel.app', 'domain')}
                          className="px-2 py-0.5 text-[10px] font-semibold border rounded hover:bg-slate-100 cursor-pointer text-slate-600"
                        >
                          {copiedKey === 'domain' ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </li>
                  </ol>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                    ✓ Assim que adicionado no Firebase Console, o login do Google funcionará imediatamente no seu link da Vercel!
                  </p>
                </div>
              </div>

              {/* Status das Regras de Segurança */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Regras de Segurança Firestore (Security Rules)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Ativas & Implantadas
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  As regras de segurança estão configuradas no Firestore garantindo que <strong>cada usuário só pode acessar suas próprias transações</strong> (padrão <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">/users/&#123;userId&#125;/transactions</code>). Nenhum cliente tem acesso aos dados de outro.
                </p>
              </div>

              {/* Parâmetros do Projeto Firebase */}
              <div className={`border rounded-xl divide-y overflow-hidden text-xs ${
                isDark ? 'border-slate-800 divide-slate-800 bg-slate-900/60' : 'border-slate-200 divide-slate-100 bg-white shadow-2xs'
              }`}>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Projeto Firebase ID</span>
                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {firebaseConfig.projectId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(firebaseConfig.projectId, 'projectId')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Copiar Project ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Banco de Dados Firestore ID</span>
                    <span className="font-mono text-xs font-semibold text-emerald-600">
                      {firebaseConfig.firestoreDatabaseId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(firebaseConfig.firestoreDatabaseId, 'dbId')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Copiar Database ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Domínio de Autenticação</span>
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      {firebaseConfig.authDomain}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(firebaseConfig.authDomain, 'authDomain')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Copiar Auth Domain"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Estrutura de Subcoleção por Cliente</span>
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      users/&#123;uid&#125;/transactions/&#123;id&#125;
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-semibold">
                    ABAC
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: COR & GERAL */}
          {activeTab === 'geral' && (
            <div className="space-y-4">
              {/* Seletor de Tema (Cor Clara / Cor Escura) */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="font-bold text-sm">Tema Visual</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Alternar entre tema Claro (Padrão) e tema Escuro
                  </p>
                </div>
                {onToggleTheme && (
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className={`px-3 py-1.5 rounded-lg border font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDark 
                        ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700' 
                        : 'bg-white text-slate-800 border-slate-200 shadow-2xs hover:bg-slate-100'
                    }`}
                  >
                    {isDark ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>Mudar para Cor Clara</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span>Mudar para Cor Escura</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Formulário de Mês e Limite */}
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">
                    Mês de Competência
                  </label>
                  <input
                    type="text"
                    value={monthInput}
                    onChange={(e) => setMonthInput(e.target.value)}
                    placeholder="Ex: Novembro 2026"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${inputClass}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">
                    Teto Máximo de Gastos do Mês (Alerta de Orçamento)
                  </label>
                  <input
                    type="text"
                    value={limitInput}
                    onChange={(e) => setLimitInput(e.target.value)}
                    placeholder="Ex: 2700.00"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${inputClass}`}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Um aviso será emitido quando as despesas ultrapassarem este valor.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Salvar Preferências
                </button>
              </form>
            </div>
          )}

          {/* ABA 5: BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border space-y-2 ${
                isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="font-bold text-sm">Backup em Arquivo JSON</div>
                <p className="text-slate-500 text-xs">
                  Baixe uma cópia de segurança de todos os seus lançamentos ou restaure um arquivo salvo anteriormente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onExportBackupJSON}
                  className="p-3 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Baixar Arquivo JSON</span>
                </button>

                <label className="p-3 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer text-center">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>Restaurar JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportBackupJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Rodapé do Modal */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <span className="text-[11px] text-slate-400">
            Total de {transactionsCount} lançamentos cadastrados
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
