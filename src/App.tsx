import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { MetricCards } from './components/MetricCards';
import { CreditCardsGrid } from './components/CreditCardsGrid';
import { AccountsGrid } from './components/AccountsGrid';
import { CategoriesGrid } from './components/CategoriesGrid';
import { FinancialCharts } from './components/FinancialCharts';
import { BudgetHealthAlert } from './components/BudgetHealthAlert';
import { TransactionTable } from './components/TransactionTable';
import { TransactionModal } from './components/TransactionModal';
import { InstallmentModal } from './components/InstallmentModal';
import { CardModal } from './components/CardModal';
import { AccountModal } from './components/AccountModal';
import { CategoryModal } from './components/CategoryModal';
import { SettingsModal } from './components/SettingsModal';
import { InvoiceModal } from './components/InvoiceModal';
import { DashboardComplete } from './components/DashboardComplete';
import { ChatTransactionModal } from './components/ChatTransactionModal';
import { Transaction, FilterType, FilterStatus, CreditCardItem, AccountItem, CategoryItem } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_CREDIT_CARDS, INITIAL_ACCOUNTS, INITIAL_CATEGORIES } from './data/initialData';
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
  clearAllFirestoreTransactions,
  subscribeToCards,
  saveCardToFirestore,
  deleteCardFromFirestore,
  seedInitialCardsIfEmpty,
  subscribeToAccounts,
  saveAccountToFirestore,
  deleteAccountFromFirestore,
  seedInitialAccountsIfEmpty,
  subscribeToCategories,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  seedInitialCategoriesIfEmpty
} from './services/firestoreService';
import { 
  ShieldCheck, 
  LogIn, 
  LayoutDashboard, 
  CreditCard, 
  Landmark,
  Tag,
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
const CARDS_STORAGE_KEY = 'finances_cards_v1';
const ACCOUNTS_STORAGE_KEY = 'finances_accounts_v1';
const CATEGORIES_STORAGE_KEY = 'finances_categories_v1';

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

  // Estado das Transações
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

  // Estado dos Cartões de Crédito
  const [cards, setCards] = useState<CreditCardItem[]>(() => {
    try {
      const saved = localStorage.getItem(CARDS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_CREDIT_CARDS;
  });

  // Estado das Contas Bancárias & Carteiras
  const [accounts, setAccounts] = useState<AccountItem[]>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_ACCOUNTS;
  });

  // Estado das Categorias
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_CATEGORIES;
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Controle de Visualização do Painel (Dashboard / Contas / Cartões / Categorias / Lançamentos / Todos)
  const [activeViewTab, setActiveViewTab] = useState<'dashboard' | 'contas' | 'cartoes' | 'categorias' | 'lancamentos' | 'todos'>('dashboard');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [selectedCardForInstallment, setSelectedCardForInstallment] = useState<string>('Cartão Neon');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Modais de Criação e Edição: Cartão, Conta, Categoria
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardItem | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Modal da Fatura de Cartão
  const [selectedInvoiceCard, setSelectedInvoiceCard] = useState<Transaction | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Testar conexão inicial com Firestore
  useEffect(() => {
    testConnection();
  }, []);

  // Monitorar autenticação individual e Firestore listeners
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      // Limpar listeners antigos se houver
      unsubs.forEach(un => un());
      unsubs = [];

      if (currentUser) {
        setIsSyncing(true);
        try {
          const profile = await syncUserProfile(currentUser);
          if (profile.isFirstTime && !profile.isZeroed) {
            await Promise.all([
              seedInitialTransactionsIfEmpty(currentUser.uid, INITIAL_TRANSACTIONS),
              seedInitialCardsIfEmpty(currentUser.uid, INITIAL_CREDIT_CARDS),
              seedInitialAccountsIfEmpty(currentUser.uid, INITIAL_ACCOUNTS),
              seedInitialCategoriesIfEmpty(currentUser.uid, INITIAL_CATEGORIES)
            ]);
          }
        } catch (e) {
          console.error('Erro na sincronização de perfil/seed:', e);
        } finally {
          setIsSyncing(false);
        }

        // 1. Listener de Transações
        const unsubTx = subscribeToTransactions(
          currentUser.uid,
          (liveTransactions) => {
            setTransactions(liveTransactions);
            setIsSyncing(false);
          },
          (error) => {
            console.error('Erro no listener de transações:', error);
            setIsSyncing(false);
          }
        );
        unsubs.push(unsubTx);

        // 2. Listener de Cartões
        const unsubCards = subscribeToCards(
          currentUser.uid,
          (liveCards) => {
            if (liveCards.length > 0) {
              setCards(liveCards);
            }
          },
          (error) => console.error('Erro no listener de cartões:', error)
        );
        unsubs.push(unsubCards);

        // 3. Listener de Contas Bancárias
        const unsubAccounts = subscribeToAccounts(
          currentUser.uid,
          (liveAccounts) => {
            if (liveAccounts.length > 0) {
              setAccounts(liveAccounts);
            }
          },
          (error) => console.error('Erro no listener de contas:', error)
        );
        unsubs.push(unsubAccounts);

        // 4. Listener de Categorias
        const unsubCategories = subscribeToCategories(
          currentUser.uid,
          (liveCategories) => {
            if (liveCategories.length > 0) {
              setCategories(liveCategories);
            }
          },
          (error) => console.error('Erro no listener de categorias:', error)
        );
        unsubs.push(unsubCategories);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubs.forEach(un => un());
    };
  }, []);

  // Persistência local (LocalStorage)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Falha ao salvar transações no localStorage:', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      console.error('Falha ao salvar cartões no localStorage:', e);
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Falha ao salvar contas no localStorage:', e);
    }
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Falha ao salvar categorias no localStorage:', e);
    }
  }, [categories]);

  // Login com Google
  const handleGoogleLogin = async () => {
    try {
      setIsSyncing(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      alert('Falha ao autenticar com Google: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsSyncing(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsGuestMode(false);
    } catch (e) {
      console.error('Erro ao sair:', e);
    }
  };

  // Cálculos consolidados dos totais
  const totals = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let creditCards = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        income += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        expenses += tx.amount;
      } else if (tx.type === 'CREDIT') {
        creditCards += tx.amount;
      }
    });

    const totalOutflow = expenses + creditCards;
    const balance = income - totalOutflow;

    return {
      income,
      expenses: totalOutflow,
      expensesOnly: expenses,
      creditCards,
      balance,
    };
  }, [transactions]);

  // Lançamentos filtrados
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase()) ||
        (tx.cardName && tx.cardName.toLowerCase().includes(search.toLowerCase())) ||
        (tx.accountName && tx.accountName.toLowerCase().includes(search.toLowerCase()));

      const matchType = typeFilter === 'ALL' || tx.type === typeFilter;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'CONSOLIDATED' && tx.consolidated) ||
        (statusFilter === 'PENDING' && !tx.consolidated);

      const matchCategory =
        categoryFilter === 'ALL' || tx.category === categoryFilter;

      return matchSearch && matchType && matchStatus && matchCategory;
    });
  }, [transactions, search, typeFilter, statusFilter, categoryFilter]);

  // Alternar status consolidado/pendente
  const handleToggleConsolidated = async (id: string) => {
    let updatedTx: Transaction | undefined;
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updatedTx = { ...t, consolidated: !t.consolidated };
          return updatedTx;
        }
        return t;
      })
    );

    if (user && updatedTx) {
      try {
        await saveTransactionToFirestore(user.uid, updatedTx);
      } catch (e) {
        console.error('Erro ao sincronizar status:', e);
      }
    }
  };

  // Seleção múltipla
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size < filteredTransactions.length) {
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

  /* =========================================================================
     AÇÕES DE CARTÕES DE CRÉDITO (CRIAR, EDITAR, EXCLUIR)
     ========================================================================= */
  const handleSaveCard = async (cardData: {
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
  }) => {
    let targetCard: CreditCardItem;

    if (cardData.id) {
      targetCard = {
        id: cardData.id,
        name: cardData.name,
        brand: cardData.brand,
        limit: cardData.limit,
        closingDay: cardData.closingDay,
        dueDay: cardData.dueDay,
        color: cardData.color,
        border: cardData.border,
        badge: cardData.badge,
        updatedAt: new Date().toISOString(),
      };
      setCards((prev) => prev.map((c) => (c.id === cardData.id ? targetCard : c)));
    } else {
      targetCard = {
        id: `card_${Date.now()}`,
        name: cardData.name,
        brand: cardData.brand,
        limit: cardData.limit,
        closingDay: cardData.closingDay,
        dueDay: cardData.dueDay,
        color: cardData.color,
        border: cardData.border,
        badge: cardData.badge,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCards((prev) => [...prev, targetCard]);

      // Se o usuário informou fatura inicial para este novo cartão, cria o lançamento
      if (cardData.initialInvoiceAmount && cardData.initialInvoiceAmount > 0) {
        const invoiceTx: Transaction = {
          id: `inv_${Date.now()}`,
          description: targetCard.name,
          amount: cardData.initialInvoiceAmount,
          type: 'CREDIT',
          category: 'Cartão de Crédito',
          consolidated: false,
          cardName: targetCard.name,
          createdAt: new Date().toISOString(),
        };
        setTransactions((prev) => [invoiceTx, ...prev]);
        if (user) {
          saveTransactionToFirestore(user.uid, invoiceTx);
        }
      }
    }

    setIsCardModalOpen(false);
    setEditingCard(null);

    if (user) {
      try {
        await saveCardToFirestore(user.uid, targetCard);
      } catch (e) {
        console.error('Erro ao salvar cartão no Firestore:', e);
      }
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    if (user) {
      try {
        await deleteCardFromFirestore(user.uid, cardId);
      } catch (e) {
        console.error('Erro ao excluir cartão no Firestore:', e);
      }
    }
  };

  /* =========================================================================
     AÇÕES DE CONTAS BANCÁRIAS E CARTEIRAS (CRIAR, EDITAR, EXCLUIR)
     ========================================================================= */
  const handleSaveAccount = async (accountData: {
    id?: string;
    name: string;
    bank?: string;
    type: any;
    balance: number;
    color?: string;
  }) => {
    let targetAccount: AccountItem;

    if (accountData.id) {
      targetAccount = {
        id: accountData.id,
        name: accountData.name,
        bank: accountData.bank,
        type: accountData.type,
        balance: accountData.balance,
        color: accountData.color,
        updatedAt: new Date().toISOString(),
      };
      setAccounts((prev) => prev.map((a) => (a.id === accountData.id ? targetAccount : a)));
    } else {
      targetAccount = {
        id: `acc_${Date.now()}`,
        name: accountData.name,
        bank: accountData.bank,
        type: accountData.type,
        balance: accountData.balance,
        color: accountData.color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAccounts((prev) => [...prev, targetAccount]);
    }

    setIsAccountModalOpen(false);
    setEditingAccount(null);

    if (user) {
      try {
        await saveAccountToFirestore(user.uid, targetAccount);
      } catch (e) {
        console.error('Erro ao salvar conta no Firestore:', e);
      }
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    if (user) {
      try {
        await deleteAccountFromFirestore(user.uid, accountId);
      } catch (e) {
        console.error('Erro ao excluir conta no Firestore:', e);
      }
    }
  };

  /* =========================================================================
     AÇÕES DE CATEGORIAS (CRIAR, EDITAR, EXCLUIR)
     ========================================================================= */
  const handleSaveCategory = async (categoryData: {
    id?: string;
    name: string;
    type: any;
    color?: string;
    budget?: number;
  }) => {
    let targetCategory: CategoryItem;

    if (categoryData.id) {
      targetCategory = {
        id: categoryData.id,
        name: categoryData.name,
        type: categoryData.type,
        color: categoryData.color,
        budget: categoryData.budget,
        updatedAt: new Date().toISOString(),
      };
      setCategories((prev) => prev.map((c) => (c.id === categoryData.id ? targetCategory : c)));
    } else {
      targetCategory = {
        id: `cat_${Date.now()}`,
        name: categoryData.name,
        type: categoryData.type,
        color: categoryData.color,
        budget: categoryData.budget,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, targetCategory]);
    }

    setIsCategoryModalOpen(false);
    setEditingCategory(null);

    if (user) {
      try {
        await saveCategoryToFirestore(user.uid, targetCategory);
      } catch (e) {
        console.error('Erro ao salvar categoria no Firestore:', e);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    if (user) {
      try {
        await deleteCategoryFromFirestore(user.uid, categoryId);
      } catch (e) {
        console.error('Erro ao excluir categoria no Firestore:', e);
      }
    }
  };

  // Restaurar dados padrão de Novembro 2026
  const handleResetData = async () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCards(INITIAL_CREDIT_CARDS);
    setAccounts(INITIAL_ACCOUNTS);
    setCategories(INITIAL_CATEGORIES);
    setCurrentMonth('Novembro 2026');

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(INITIAL_CREDIT_CARDS));
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_ACCOUNTS));
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
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
      version: '2.0',
      exportedAt: new Date().toISOString(),
      month: currentMonth,
      spendingLimit,
      transactions,
      cards,
      accounts,
      categories,
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
          if (Array.isArray(parsed.cards)) setCards(parsed.cards);
          if (Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
          if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
          if (parsed.month) setCurrentMonth(parsed.month);
          if (parsed.spendingLimit) setSpendingLimit(parsed.spendingLimit);

          if (user) {
            await resetFirestoreTransactions(user.uid, parsed.transactions);
          }
          alert('Backup completo restaurado com sucesso!');
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

  // Modal de Fatura
  const handleSelectCardForInvoice = (card: Transaction) => {
    setSelectedInvoiceCard(card);
    setIsInvoiceModalOpen(true);
  };

  const handleUpdateInvoiceCard = async (updatedCard: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedCard.id ? updatedCard : t))
    );
    if (user) {
      try {
        await saveTransactionToFirestore(user.uid, updatedCard);
      } catch (e) {
        console.error('Erro ao atualizar fatura do cartão no Firestore:', e);
      }
    }
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

  // TELA DE LOGIN INDIVIDUAL
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
      {/* Barra de Navegação Superior */}
      <Header
        currentMonth={currentMonth}
        user={user}
        isGuest={isGuestMode}
        isSyncing={isSyncing}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenChat={() => setIsChatModalOpen(true)}
        onOpenNewTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

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

        {/* Barra de Navegação de Visualizações: Dashboard | Contas | Cartões | Categorias | Lançamentos */}
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
            </button>

            <button
              onClick={() => setActiveViewTab('contas')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                activeViewTab === 'contas'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 shrink-0" />
              <span>Contas</span>
              <span className="hidden sm:inline">& Bancos</span>
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
              onClick={() => setActiveViewTab('categorias')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                activeViewTab === 'categorias'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span>Categorias</span>
            </button>

            <button
              onClick={() => setActiveViewTab('lancamentos')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                activeViewTab === 'lancamentos'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5 shrink-0" />
              <span>Extrato</span>
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

          {/* Área de Ações Rápidas de Criação: + Lançamento, + Cartão, + Conta, + Categoria */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 text-xs">
            {/* Ações Diretas de Criação Solicitadas pelo Usuário */}
            <button
              onClick={() => {
                setEditingCard(null);
                setIsCardModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold transition-colors cursor-pointer"
              title="Ação de Criar Cartão de Crédito"
            >
              <CreditCard className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>+ Cartão</span>
            </button>

            <button
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-blue-300 dark:border-blue-800/60 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-semibold transition-colors cursor-pointer"
              title="Ação de Criar Conta Bancária ou Carteira"
            >
              <Landmark className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>+ Conta</span>
            </button>

            <button
              onClick={() => {
                setEditingCategory(null);
                setIsCategoryModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-semibold transition-colors cursor-pointer"
              title="Ação de Criar Categoria"
            >
              <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>+ Categoria</span>
            </button>

            {/* Botão de Lançar por Chat 100% Grátis */}
            <button
              onClick={() => setIsChatModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Lançamento Inteligente por Chat (100% Grátis)"
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Chat</span>
            </button>

            {/* Botão de Lançamento no topo */}
            <button
              onClick={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Novo Lançamento Financeiro"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lançar</span>
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

        {/* 2. SEÇÃO: CONTAS BANCÁRIAS E CARTEIRAS */}
        {(activeViewTab === 'contas' || activeViewTab === 'todos') && (
          <section className="space-y-4">
            <AccountsGrid
              accounts={accounts}
              onOpenNewAccount={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              onEditAccount={(acc) => {
                setEditingAccount(acc);
                setIsAccountModalOpen(true);
              }}
              onDeleteAccount={handleDeleteAccount}
              isDark={isDark}
            />
          </section>
        )}

        {/* 3. SEÇÃO: FATURAS DOS CARTÕES DE CRÉDITO */}
        {(activeViewTab === 'cartoes' || activeViewTab === 'todos') && (
          <section className="space-y-4">
            <CreditCardsGrid
              transactions={transactions}
              cards={cards}
              onToggleStatus={handleToggleConsolidated}
              onFilterByCard={handleFilterByCard}
              onOpenInstallmentForCard={handleOpenInstallmentForCard}
              onSelectCardForInvoice={handleSelectCardForInvoice}
              onOpenNewCard={() => {
                setEditingCard(null);
                setIsCardModalOpen(true);
              }}
              onEditCard={(c) => {
                setEditingCard(c);
                setIsCardModalOpen(true);
              }}
              isDark={isDark}
            />
          </section>
        )}

        {/* 4. SEÇÃO: CATEGORIAS */}
        {(activeViewTab === 'categorias' || activeViewTab === 'todos') && (
          <section className="space-y-4">
            <CategoriesGrid
              categories={categories}
              onOpenNewCategory={() => {
                setEditingCategory(null);
                setIsCategoryModalOpen(true);
              }}
              onEditCategory={(cat) => {
                setEditingCategory(cat);
                setIsCategoryModalOpen(true);
              }}
              onDeleteCategory={handleDeleteCategory}
              isDark={isDark}
            />
          </section>
        )}

        {/* 5. SEÇÃO: GERENCIADOR E TABELA DE LANÇAMENTOS */}
        {(activeViewTab === 'lancamentos' || activeViewTab === 'todos') && (
          <section className="space-y-4">
            <TransactionTable
              transactions={filteredTransactions}
              selectedIds={selectedIds}
              search={search}
              typeFilter={typeFilter}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              allCategories={categories.map((c) => c.name)}
              onSearchChange={setSearch}
              onTypeFilterChange={setTypeFilter}
              onStatusFilterChange={setStatusFilter}
              onCategoryFilterChange={setCategoryFilter}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleConsolidated={handleToggleConsolidated}
              onEditTransaction={(tx: Transaction) => {
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

      {/* Modal de Transação / Lançamento */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
        categories={categories}
        cards={cards}
        accounts={accounts}
        onOpenNewCategory={() => {
          setEditingCategory(null);
          setIsCategoryModalOpen(true);
        }}
        onOpenNewCard={() => {
          setEditingCard(null);
          setIsCardModalOpen(true);
        }}
        onOpenNewAccount={() => {
          setEditingAccount(null);
          setIsAccountModalOpen(true);
        }}
        isDark={isDark}
      />

      {/* Modal de Lançamento de Compra Parcelada */}
      <InstallmentModal
        isOpen={isInstallmentModalOpen}
        onClose={() => setIsInstallmentModalOpen(false)}
        defaultCard={selectedCardForInstallment}
        cards={cards}
        categories={categories}
        onSave={handleSaveInstallment}
        isDark={isDark}
      />

      {/* Modal da Fatura de Cartão de Crédito */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceCard(null);
        }}
        cardTransaction={selectedInvoiceCard}
        allTransactions={transactions}
        currentMonth={currentMonth}
        onUpdateInvoiceAmount={async (id: string, newAmount: number) => {
          const found = transactions.find((t) => t.id === id);
          if (found) {
            await handleSaveTransaction({
              description: found.description,
              amount: newAmount,
              type: found.type,
              category: found.category,
              consolidated: found.consolidated,
              cardName: found.cardName,
            });
          }
        }}
        onToggleInvoiceStatus={async (id: string) => {
          await handleToggleConsolidated(id);
        }}
        isDark={isDark}
      />

      {/* Modal de Assistente de Chat 100% Gratuito */}
      <ChatTransactionModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        onLaunchTransaction={async (newTxData) => {
          await handleSaveTransaction(newTxData);
        }}
        cards={cards}
        categories={categories}
        accounts={accounts}
        isDark={isDark}
      />

      {/* Modal de Criação / Edição de Cartão de Crédito */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        editingCard={editingCard}
        isDark={isDark}
      />

      {/* Modal de Criação / Edição de Conta Bancária */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
        editingAccount={editingAccount}
        isDark={isDark}
      />

      {/* Modal de Criação / Edição de Categoria */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
        editingCategory={editingCategory}
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

      {/* Botões Flutuantes (FAB) para Desktop e Tablet */}
      <div className="hidden sm:flex fixed bottom-6 right-6 z-40 items-center gap-3 no-print">
        {/* Botão de Chat Grátis */}
        <button
          onClick={() => setIsChatModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-3 bg-slate-900/90 dark:bg-slate-800/90 hover:bg-slate-900 dark:hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 hover:border-emerald-400 text-sm font-bold rounded-full shadow-lg shadow-black/20 hover:shadow-xl transition-all cursor-pointer group"
          title="Lançamento Inteligente por Chat (100% Grátis)"
          aria-label="Abrir Chat de Lançamento"
        >
          <Bot className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Chat Grátis</span>
        </button>

        {/* Botão Principal de Lançamento */}
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

          {/* Aba Contas */}
          <button
            onClick={() => setActiveViewTab('contas')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeViewTab === 'contas'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Landmark className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">Contas</span>
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
