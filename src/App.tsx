import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { MetricCards } from './components/MetricCards';
import { CreditCardsGrid } from './components/CreditCardsGrid';
import { FinancialCharts } from './components/FinancialCharts';
import { BudgetHealthAlert } from './components/BudgetHealthAlert';
import { TransactionTable } from './components/TransactionTable';
import { TransactionModal } from './components/TransactionModal';
import { InstallmentModal } from './components/InstallmentModal';
import { SettingsModal } from './components/SettingsModal';
import { InvoiceModal } from './components/InvoiceModal';
import { DashboardComplete } from './components/DashboardComplete';
import { ChatTransactionModal } from './components/ChatTransactionModal';
import { Transaction, FilterType, FilterStatus } from './types';
import { INITIAL_TRANSACTIONS } from './data/initialData';
import { exportTransactionsToCSV, formatMoney } from './utils/formatters';
import { auth, googleProvider, testConnection } from './firebase';
import { 
  syncUserProfile, 
  subscribeToTransactions, 
  saveTransactionToFirestore, 
  deleteTransactionFromFirestore, 
  bulkUpdateConsolidatedInFirestore, 
  bulkDeleteTransactionsFromFirestore,
  seedInitialTransactionsIfEmpty,
  resetFirestoreTransactions,
  clearAllFirestoreTransactions
} from './services/firestoreService';
import { 
  ShieldCheck, 
  LogIn, 
  LayoutDashboard, 
  CreditCard, 
  ReceiptText, 
  Layers,
  Sparkles,
  Plus,
  Settings,
  MessageSquareQuote,
  Bot
} from 'lucide-react';

const STORAGE_KEY = 'finances_2026_v1';
const MONTH_STORAGE_KEY = 'finances_month_v1';
const LIMIT_STORAGE_KEY = 'finances_limit_v1';
const THEME_STORAGE_KEY = 'finances_theme_v1';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Tema padrão: "light" (COR CLARA)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  const isDark = theme === 'dark';

  const handleToggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (e) {
      console.error(e);
    }
  };

  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    try {
      return localStorage.getItem(MONTH_STORAGE_KEY) || 'Novembro 2026';
    } catch {
      return 'Novembro 2026';
    }
  });

  const [spendingLimit, setSpendingLimit] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LIMIT_STORAGE_KEY);
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_TRANSACTIONS;
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Controle de Visualização do Painel (Dashboard / Cartões / Lançamentos / Todos)
  const [activeViewTab, setActiveViewTab] = useState<'dashboard' | 'cartoes' | 'lancamentos' | 'todos'>('dashboard');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [selectedCardForInstallment, setSelectedCardForInstallment] = useState<string>('Cartão Neon');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Modal da Fatura de Cartão (Clicar nos cartões para abrir fatura, pagar e alterar valor)
  const [selectedInvoiceCard, setSelectedInvoiceCard] = useState<Transaction | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Testar conexão inicial com Firestore
  useEffect(() => {
    testConnection();
  }, []);

  // Monitorar autenticação individual
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      if (currentUser) {
        setIsSyncing(true);
        try {
          const profile = await syncUserProfile(currentUser);
          if (profile.isFirstTime && !profile.isZeroed) {
            await seedInitialTransactionsIfEmpty(currentUser.uid, INITIAL_TRANSACTIONS);
          }
        } catch (e) {
          console.error('Erro na sincronização de perfil/seed:', e);
        } finally {
          setIsSyncing(false);
        }

        // Inscrição em tempo real na subcoleção individual do cliente
        const unsubscribeFirestore = subscribeToTransactions(
          currentUser.uid,
          (liveTransactions) => {
            setTransactions(liveTransactions);
            setIsSyncing(false);
          },
          (error) => {
            console.error('Erro no listener do Firestore:', error);
            setIsSyncing(false);
          }
        );

        return () => {
          unsubscribeFirestore();
        };
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Salvar no localStorage quando em modo guest ou para cache local
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Falha ao salvar no armazenamento local:', e);
    }
  }, [transactions]);

  // Login com Google
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsGuestMode(false);
    } catch (err) {
      console.error('Erro ao realizar login Google:', err);
      throw err;
    }
  };

  // Logout / Trocar de usuário individual
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsGuestMode(false);
      setTransactions([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
    } catch (err) {
      console.error('Erro ao desconectar:', err);
    }
  };

  // Totais calculados
  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type !== 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const creditCards = transactions
      .filter((t) => t.type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);

    const consolidatedExpenses = transactions
      .filter((t) => t.type !== 'INCOME' && t.consolidated)
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingExpenses = transactions
      .filter((t) => t.type !== 'INCOME' && !t.consolidated)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      creditCards,
      consolidatedExpenses,
      pendingExpenses,
    };
  }, [transactions]);

  // Categorias disponíveis
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats).sort();
  }, [transactions]);

  // Transações filtradas
  const filteredTransactions = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return transactions.filter((t) => {
      const matchesSearch =
        !searchLower ||
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower) ||
        (t.cardName && t.cardName.toLowerCase().includes(searchLower));

      const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'CONSOLIDATED' ? t.consolidated : !t.consolidated);

      const matchesCategory =
        categoryFilter === 'ALL' || t.category === categoryFilter;

      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });
  }, [transactions, search, typeFilter, statusFilter, categoryFilter]);

  // Alternar status consolidado de uma transação
  const handleToggleConsolidated = async (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;
    const newStatus = !target.consolidated;

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, consolidated: newStatus } : t))
    );

    if (user) {
      try {
        await saveTransactionToFirestore(user.uid, { ...target, consolidated: newStatus });
      } catch (e) {
        console.error('Erro ao sincronizar com Firestore:', e);
      }
    }
  };

  // Abrir Fatura do Cartão (Quando o usuário clica no cartão)
  const handleSelectCardForInvoice = (card: Transaction) => {
    setSelectedInvoiceCard(card);
    setIsInvoiceModalOpen(true);
  };

  // Alterar valor da fatura
  const handleUpdateInvoiceAmount = async (id: string, newAmount: number) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;
    const updated = { ...target, amount: newAmount };
    
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    setSelectedInvoiceCard(updated);

    if (user) {
      try {
        await saveTransactionToFirestore(user.uid, updated);
      } catch (e) {
        console.error('Erro ao atualizar valor da fatura no Firestore:', e);
      }
    }
  };

  // Alternar pagamento da fatura
  const handleToggleInvoicePayment = async (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;
    const newStatus = !target.consolidated;
    
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, consolidated: newStatus } : t))
    );
    setSelectedInvoiceCard({ ...target, consolidated: newStatus });

    if (user) {
      try {
        await saveTransactionToFirestore(user.uid, { ...target, consolidated: newStatus });
      } catch (e) {
        console.error('Erro ao sincronizar pagamento da fatura:', e);
      }
    }
  };

  // Seleção individual
  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Selecionar todos os visíveis
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Ações em massa
  const handleBulkConsolidated = async (consolidated: boolean) => {
    const ids = Array.from(selectedIds);
    setTransactions((prev) =>
      prev.map((t) => (selectedIds.has(t.id) ? { ...t, consolidated } : t))
    );
    setSelectedIds(new Set());

    if (user && ids.length > 0) {
      try {
        await bulkUpdateConsolidatedInFirestore(user.uid, ids, consolidated);
      } catch (e) {
        console.error('Erro na consolidação em massa:', e);
      }
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (window.confirm(`Tem certeza que deseja excluir ${ids.length} lançamentos?`)) {
      setTransactions((prev) => prev.filter((t) => !selectedIds.has(t.id)));
      setSelectedIds(new Set());

      if (user && ids.length > 0) {
        try {
          await bulkDeleteTransactionsFromFirestore(user.uid, ids);
        } catch (e) {
          console.error('Erro ao excluir em massa no Firestore:', e);
        }
      }
    }
  };

  // Salvar/Editar transação individual
  const handleSaveTransaction = async (data: Omit<Transaction, 'id'>) => {
    let targetTx: Transaction;

    if (editingTx) {
      targetTx = {
        ...editingTx,
        ...data,
      };
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingTx.id ? targetTx : t))
      );
    } else {
      targetTx = {
        id: Date.now().toString(),
        ...data,
      };
      setTransactions((prev) => [targetTx, ...prev]);
    }

    setIsTxModalOpen(false);
    setEditingTx(null);

    if (user) {
      try {
        await saveTransactionToFirestore(user.uid, targetTx);
      } catch (e) {
        console.error('Erro ao salvar no Firestore:', e);
      }
    }
  };

  // Salvar compra parcelada
  const handleSaveInstallment = async (purchase: {
    description: string;
    cardName: string;
    totalAmount: number;
    installmentsCount: number;
    installmentAmount: number;
    category: string;
    addToCurrentInvoice: boolean;
  }) => {
    const parentId = `pur_${Date.now()}`;
    const newTx: Transaction = {
      id: `${parentId}_1`,
      description: `${purchase.description} (1/${purchase.installmentsCount})`,
      amount: purchase.installmentAmount,
      type: 'EXPENSE',
      category: purchase.category,
      consolidated: false,
      cardName: purchase.cardName,
      installmentInfo: {
        current: 1,
        total: purchase.installmentsCount,
        parentPurchaseId: parentId,
      },
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (user) {
      try {
        await saveTransactionToFirestore(user.uid, newTx);
      } catch (e) {
        console.error('Erro ao salvar parcela no Firestore:', e);
      }
    }
  };

  // Excluir transação
  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (user) {
        try {
          await deleteTransactionFromFirestore(user.uid, id);
        } catch (e) {
          console.error('Erro ao deletar no Firestore:', e);
        }
      }
    }
  };

  // Restaurar dados padrão de Novembro 2026
  const handleResetData = async () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCurrentMonth('Novembro 2026');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(MONTH_STORAGE_KEY, 'Novembro 2026');
    } catch (e) {
      console.error(e);
    }

    if (user) {
      try {
        await resetFirestoreTransactions(user.uid, INITIAL_TRANSACTIONS);
      } catch (e) {
        console.error('Erro ao restaurar dados padrão no Firestore:', e);
      }
    }
  };

  // ZERAR TODOS OS DADOS (Começar do zero com R$ 0,00)
  const handleClearAllData = async () => {
    setTransactions([]);
    setSelectedIds(new Set());
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }

    if (user) {
      try {
        await clearAllFirestoreTransactions(user.uid);
      } catch (e) {
        console.error('Erro ao zerar dados no Firestore:', e);
      }
    }
  };

  // Atualizar mês
  const handleUpdateMonth = (newMonth: string) => {
    setCurrentMonth(newMonth);
    try {
      localStorage.setItem(MONTH_STORAGE_KEY, newMonth);
    } catch (e) {
      console.error(e);
    }
  };

  // Atualizar teto de gastos
  const handleUpdateSpendingLimit = (limit: number) => {
    setSpendingLimit(limit);
    try {
      localStorage.setItem(LIMIT_STORAGE_KEY, limit.toString());
    } catch (e) {
      console.error(e);
    }
  };

  // Exportar Backup JSON
  const handleExportBackupJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      month: currentMonth,
      spendingLimit,
      transactions,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_financeiro_${currentMonth.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar Backup JSON
  const handleImportBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (Array.isArray(parsed.transactions)) {
          setTransactions(parsed.transactions);
          if (parsed.month) setCurrentMonth(parsed.month);
          if (parsed.spendingLimit) setSpendingLimit(parsed.spendingLimit);

          if (user) {
            await resetFirestoreTransactions(user.uid, parsed.transactions);
          }
          alert('Backup restaurado com sucesso!');
        } else {
          alert('O arquivo selecionado não contém uma lista válida de lançamentos.');
        }
      } catch (err) {
        alert('Erro ao carregar o arquivo de backup JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Exportar PDF / Imprimir
  const handleExportPDF = () => {
    window.print();
  };

  // Exportar CSV
  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions);
  };

  // Ações de atalho dos cartões
  const handleFilterByCard = (cardName: string) => {
    setSearch(cardName);
    setActiveViewTab('lancamentos');
  };

  const handleOpenInstallmentForCard = (cardName: string) => {
    setSelectedCardForInstallment(cardName);
    setIsInstallmentModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
  };

  // Enquanto aguarda a verificação inicial de autenticação, exibe skeleton suave
  if (!authChecked) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Carregando painel individual...
          </span>
        </div>
      </div>
    );
  }

  // TELA DE LOGIN INDIVIDUAL (Se o usuário não estiver autenticado e não escolheu modo visitante)
  if (!user && !isGuestMode) {
    return (
      <LoginScreen
        onLoginGoogle={handleGoogleLogin}
        onContinueAsGuest={() => {
          setIsGuestMode(true);
          if (transactions.length === 0) {
            setTransactions(INITIAL_TRANSACTIONS);
          }
        }}
        isDark={isDark}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
      isDark 
        ? 'bg-slate-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300' 
        : 'bg-slate-50 text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-800'
    }`}>
      {/* Barra de Navegação Superior (Limpa e elegante, todas as ações transferidas para Configurações) */}
      <Header
        currentMonth={currentMonth}
        user={user}
        isGuest={isGuestMode}
        isSyncing={isSyncing}
        isDark={isDark}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenChat={() => setIsChatModalOpen(true)}
      />

      {/* Banner Informativo em Modo Convidado */}
      {!user && isGuestMode && (
        <div className={`border-b py-2.5 px-3 sm:px-4 text-xs no-print ${
          isDark 
            ? 'bg-amber-950/40 border-amber-800/40 text-amber-200' 
            : 'bg-amber-50/90 border-amber-200 text-amber-900 shadow-2xs'
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Você está em <strong>Modo Demonstração</strong>. Para salvar seus dados em uma conta individual protegida, conecte-se com sua conta Google.
              </span>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Fazer Login Individual</span>
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-8 space-y-5 sm:space-y-6">
        
        {/* Cabeçalho de Impressão Otimizado para Relatório PDF */}
        <div className="hidden print-only mb-6 border-b border-slate-300 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Relatório Financeiro Individual Consolidado
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Competência: {currentMonth} • Usuário: {user ? (user.displayName || user.email) : 'Demonstração'}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              Emitido em: {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4 pt-3 border-t border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block">Receitas:</span>
              <strong className="text-slate-900 font-mono">{formatMoney(totals.income)}</strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Despesas Totais:</span>
              <strong className="text-slate-900 font-mono">{formatMoney(totals.expenses)}</strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Saldo Líquido:</span>
              <strong className="text-slate-900 font-mono">{formatMoney(totals.balance)}</strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Total Cartões:</span>
              <strong className="text-slate-900 font-mono">{formatMoney(totals.creditCards)}</strong>
            </div>
          </div>
        </div>

        {/* Barra de Navegação de Visualizações: Dashboard Completo | Faturas de Cartão | Lançamentos */}
        <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar scroll-smooth shrink-0 max-w-full">
            <button
              onClick={() => setActiveViewTab('dashboard')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                activeViewTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>Dashboard</span>
              <span className="hidden sm:inline">Completo</span>
            </button>

            <button
              onClick={() => setActiveViewTab('cartoes')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                activeViewTab === 'cartoes'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>Cartões</span>
              <span className="hidden sm:inline">& Faturas</span>
            </button>

            <button
              onClick={() => setActiveViewTab('lancamentos')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                activeViewTab === 'lancamentos'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5 shrink-0" />
              <span>Lançamentos</span>
              <span className="hidden sm:inline">& Extrato</span>
            </button>

            <button
              onClick={() => setActiveViewTab('todos')}
              className={`hidden lg:flex px-3.5 py-1.5 rounded-lg transition-all items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                activeViewTab === 'todos'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Visão Geral</span>
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            <span className="text-slate-500 text-[11px] sm:text-xs">Competência:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border px-2.5 py-1 rounded-lg">
              {currentMonth}
            </span>

            {/* Botão de Lançar por Chat 100% Grátis */}
            <button
              onClick={() => setIsChatModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-xs"
              title="Lançamento Inteligente por Chat (100% Grátis)"
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Chat</span>
              <span className="hidden sm:inline">Grátis</span>
            </button>

            {/* Botão de Lançamento no topo (Rápido em todas as telas) */}
            <button
              onClick={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer text-xs"
              title="Novo Lançamento Financeiro"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Lançamento</span>
            </button>
          </div>
        </div>

        {/* 1. SEÇÃO: DASHBOARD COMPLETO */}
        {(activeViewTab === 'dashboard' || activeViewTab === 'todos') && (
          <section className="space-y-6">
            <DashboardComplete
              transactions={transactions}
              currentMonth={currentMonth}
              spendingLimit={spendingLimit}
              onOpenCardInvoice={handleSelectCardForInvoice}
              onToggleStatus={handleToggleConsolidated}
              isDark={isDark}
            />

            {/* Alerta de Saúde Orçamentária se houver déficit */}
            <BudgetHealthAlert
              totalIncome={totals.income}
              totalExpenses={totals.expenses}
              netBalance={totals.balance}
              totalCreditCards={totals.creditCards}
              isDark={isDark}
            />

            {/* Gráficos Financeiros com Rosca e Fluxo */}
            <FinancialCharts 
              transactions={transactions} 
              isDark={isDark}
            />
          </section>
        )}

        {/* 2. SEÇÃO: FATURAS DOS CARTÕES DE CRÉDITO */}
        {(activeViewTab === 'cartoes' || activeViewTab === 'todos') && (
          <section className="space-y-4">
            <CreditCardsGrid
              transactions={transactions}
              onToggleStatus={handleToggleConsolidated}
              onFilterByCard={handleFilterByCard}
              onOpenInstallmentForCard={handleOpenInstallmentForCard}
              onSelectCardForInvoice={handleSelectCardForInvoice}
              isDark={isDark}
            />
          </section>
        )}

        {/* 3. SEÇÃO: GERENCIADOR E TABELA DE LANÇAMENTOS */}
        {(activeViewTab === 'lancamentos' || activeViewTab === 'todos') && (
          <section className="space-y-4">
            <TransactionTable
              transactions={filteredTransactions}
              search={search}
              onSearchChange={setSearch}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              allCategories={allCategories}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleConsolidated={handleToggleConsolidated}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onBulkConsolidated={handleBulkConsolidated}
              onBulkDelete={handleBulkDelete}
              onOpenTransactionModal={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onOpenInstallmentModal={() => setIsInstallmentModalOpen(true)}
              onOpenChat={() => setIsChatModalOpen(true)}
              onClearFilters={handleClearFilters}
              isDark={isDark}
            />
          </section>
        )}

      </main>

      {/* Modal de Fatura do Cartão de Crédito (Pagar e Alterar Valor da Fatura) */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceCard(null);
        }}
        cardTransaction={selectedInvoiceCard}
        allTransactions={transactions}
        onUpdateInvoiceAmount={handleUpdateInvoiceAmount}
        onToggleInvoiceStatus={handleToggleInvoicePayment}
        onAddTransactionToCard={handleOpenInstallmentForCard}
        currentMonth={currentMonth}
        isDark={isDark}
      />

      {/* Modal de Novo/Editar Lançamento */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
        isDark={isDark}
      />

      {/* Modal de Compra Parcelada */}
      <InstallmentModal
        isOpen={isInstallmentModalOpen}
        onClose={() => setIsInstallmentModalOpen(false)}
        defaultCard={selectedCardForInstallment}
        onSave={handleSaveInstallment}
        isDark={isDark}
      />

      {/* Modal de Configurações, Relatórios e Opção de Zerar */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onLogout={handleLogout}
        currentMonth={currentMonth}
        onUpdateMonth={handleUpdateMonth}
        transactionsCount={transactions.length}
        onClearAllData={handleClearAllData}
        onResetToDefault={handleResetData}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
        onExportBackupJSON={handleExportBackupJSON}
        onImportBackupJSON={handleImportBackupJSON}
        spendingLimit={spendingLimit}
        onUpdateSpendingLimit={handleUpdateSpendingLimit}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Modal de Lançamento por Chat 100% Grátis */}
      <ChatTransactionModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        onLaunchTransaction={handleSaveTransaction}
        isDark={isDark}
      />

      {/* Botões Flutuantes (FABs) para Desktop / Telas Maiores */}
      <div className="fixed bottom-6 right-6 z-40 no-print hidden sm:flex items-center gap-3">
        {/* Botão FAB do Chat Grátis */}
        <button
          onClick={() => setIsChatModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 active:scale-95 font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer group"
          title="Lançamento Inteligente por Chat (100% Grátis)"
          aria-label="Lançar por Chat"
        >
          <Bot className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Chat Grátis</span>
        </button>

        {/* Botão FAB Novo Lançamento Tradicional */}
        <button
          onClick={() => {
            setEditingTx(null);
            setIsTxModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-sm rounded-full shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all cursor-pointer group"
          title="Fazer Novo Lançamento Financeiro"
          aria-label="Novo Lançamento"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Botão Flutuante do Chat para Smartphones (Acesso Rápido com Um Toque) */}
      <div className="sm:hidden fixed bottom-20 right-4 z-40 no-print">
        <button
          onClick={() => setIsChatModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900/95 dark:bg-slate-800/95 text-emerald-400 border border-emerald-500/50 active:scale-90 font-bold text-xs rounded-full shadow-xl shadow-black/30 backdrop-blur-md transition-all cursor-pointer"
          title="Lançar por Chat 100% Grátis"
          aria-label="Chat de Lançamento"
        >
          <Bot className="w-4 h-4 text-emerald-400" />
          <span>Chat Grátis</span>
        </button>
      </div>

      {/* Barra de Navegação Inferior Nativa para Smartphones (Mobile Bottom Bar) */}
      <nav 
        aria-label="Navegação mobile"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-30 no-print border-t backdrop-blur-lg px-2 py-1.5 transition-colors ${
          isDark 
            ? 'bg-slate-900/95 border-slate-800 text-slate-400' 
            : 'bg-white/95 border-slate-200 text-slate-500 shadow-lg'
        }`}
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center text-center">
          
          {/* Aba Dashboard */}
          <button
            onClick={() => setActiveViewTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeViewTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">Início</span>
          </button>

          {/* Aba Cartões */}
          <button
            onClick={() => setActiveViewTab('cartoes')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeViewTab === 'cartoes'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">Cartões</span>
          </button>

          {/* BOTÃO PRINCIPAL DE LANÇAMENTO (Centro de Destaque para Smartphone) */}
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-90 text-white shadow-lg shadow-emerald-600/40 ring-4 ring-slate-50 dark:ring-slate-950 flex items-center justify-center transition-all cursor-pointer"
              title="Lançar Nova Transação"
              aria-label="Lançar Transação"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              Lançar
            </span>
          </div>

          {/* Aba Extrato / Lançamentos */}
          <button
            onClick={() => setActiveViewTab('lancamentos')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeViewTab === 'lancamentos'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ReceiptText className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">Extrato</span>
          </button>

          {/* Aba Ajustes / Configurações */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center justify-center py-1 transition-colors cursor-pointer hover:text-slate-900 dark:hover:text-white"
          >
            <Settings className="w-4 h-4 mb-0.5 text-slate-500" />
            <span className="text-[10px] leading-tight">Ajustes</span>
          </button>

        </div>
      </nav>
    </div>
  );
}
