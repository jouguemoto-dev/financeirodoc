import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  getDoc,
  writeBatch 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Transaction, CreditCardItem, AccountItem, CategoryItem } from '../types';

export interface UserProfileData {
  email: string;
  displayName: string;
  photoURL: string;
  isZeroed?: boolean;
  initialized?: boolean;
  updatedAt: string;
  createdAt?: string;
}

export const syncUserProfile = async (user: User): Promise<{ isFirstTime: boolean; isZeroed: boolean }> => {
  const userPath = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userDocRef);
    const exists = existingSnap.exists();
    const existingData = exists ? (existingSnap.data() as Partial<UserProfileData>) : null;

    const isFirstTime = !exists || !existingData?.initialized;
    const isZeroed = Boolean(existingData?.isZeroed);

    const updatePayload: Record<string, any> = {
      email: user.email || 'cliente@usuario.com',
      displayName: user.displayName || user.email?.split('@')[0] || 'Cliente',
      photoURL: user.photoURL || '',
      updatedAt: new Date().toISOString(),
      initialized: true,
    };

    if (isFirstTime) {
      updatePayload.createdAt = new Date().toISOString();
      updatePayload.isZeroed = false;
    }

    await setDoc(userDocRef, updatePayload, { merge: true });
    return { isFirstTime, isZeroed };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
    return { isFirstTime: false, isZeroed: false };
  }
};

/* =========================================================================
   TRANSAÇÕES (Lançamentos)
   ========================================================================= */

export const subscribeToTransactions = (
  userId: string,
  onSuccess: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
) => {
  const path = `users/${userId}/transactions`;
  const colRef = collection(db, 'users', userId, 'transactions');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          description: data.description || '',
          amount: Number(data.amount) || 0,
          type: data.type || 'EXPENSE',
          category: data.category || 'Geral',
          consolidated: Boolean(data.consolidated),
          cardName: data.cardName || undefined,
          accountId: data.accountId || undefined,
          accountName: data.accountName || undefined,
          installmentInfo: data.installmentInfo || undefined,
          userId: data.userId || userId,
          createdAt: data.createdAt || undefined,
          updatedAt: data.updatedAt || undefined,
        });
      });
      onSuccess(items);
    },
    (error) => {
      console.error('Erro na sincronização Firestore de transações:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
};

export const saveTransactionToFirestore = async (
  userId: string,
  transaction: Transaction
) => {
  const path = `users/${userId}/transactions/${transaction.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transaction.id);
    const cleanData: Record<string, any> = {
      description: transaction.description.trim().slice(0, 150),
      amount: Number(transaction.amount),
      type: transaction.type,
      category: transaction.category.trim().slice(0, 60),
      consolidated: Boolean(transaction.consolidated),
      userId: userId,
      updatedAt: new Date().toISOString(),
    };

    if (transaction.cardName) {
      cleanData.cardName = transaction.cardName.trim().slice(0, 60);
    }
    if (transaction.accountId) {
      cleanData.accountId = transaction.accountId;
    }
    if (transaction.accountName) {
      cleanData.accountName = transaction.accountName.trim().slice(0, 60);
    }
    if (transaction.installmentInfo) {
      cleanData.installmentInfo = transaction.installmentInfo;
    }
    if (transaction.createdAt) {
      cleanData.createdAt = transaction.createdAt;
    } else {
      cleanData.createdAt = new Date().toISOString();
    }

    await setDoc(doc(db, 'users', userId), { isZeroed: false, updatedAt: new Date().toISOString() }, { merge: true });
    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteTransactionFromFirestore = async (
  userId: string,
  transactionId: string
) => {
  const path = `users/${userId}/transactions/${transactionId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'transactions', transactionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const bulkUpdateConsolidatedInFirestore = async (
  userId: string,
  transactionIds: string[],
  consolidated: boolean
) => {
  const path = `users/${userId}/transactions`;
  try {
    const batch = writeBatch(db);
    transactionIds.forEach((id) => {
      const ref = doc(db, 'users', userId, 'transactions', id);
      batch.update(ref, {
        consolidated,
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const bulkDeleteTransactionsFromFirestore = async (
  userId: string,
  transactionIds: string[]
) => {
  const path = `users/${userId}/transactions`;
  try {
    const batch = writeBatch(db);
    transactionIds.forEach((id) => {
      const ref = doc(db, 'users', userId, 'transactions', id);
      batch.delete(ref);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

/* =========================================================================
   CARTÕES DE CRÉDITO (Credit Cards)
   ========================================================================= */

export const subscribeToCards = (
  userId: string,
  onSuccess: (cards: CreditCardItem[]) => void,
  onError?: (error: Error) => void
) => {
  const path = `users/${userId}/cards`;
  const colRef = collection(db, 'users', userId, 'cards');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: CreditCardItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || '',
          brand: data.brand || 'Personalizado',
          limit: data.limit ? Number(data.limit) : undefined,
          closingDay: data.closingDay ? Number(data.closingDay) : undefined,
          dueDay: data.dueDay ? Number(data.dueDay) : undefined,
          color: data.color || undefined,
          border: data.border || undefined,
          badge: data.badge || undefined,
          userId: data.userId || userId,
          createdAt: data.createdAt || undefined,
          updatedAt: data.updatedAt || undefined,
        });
      });
      onSuccess(items);
    },
    (error) => {
      console.error('Erro na sincronização Firestore de cartões:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
};

export const saveCardToFirestore = async (
  userId: string,
  card: CreditCardItem
) => {
  const path = `users/${userId}/cards/${card.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'cards', card.id);
    const cleanData: Record<string, any> = {
      name: card.name.trim().slice(0, 60),
      brand: card.brand.trim().slice(0, 40),
      userId: userId,
      updatedAt: new Date().toISOString(),
    };
    if (card.limit !== undefined) cleanData.limit = Number(card.limit);
    if (card.closingDay !== undefined) cleanData.closingDay = Number(card.closingDay);
    if (card.dueDay !== undefined) cleanData.dueDay = Number(card.dueDay);
    if (card.color) cleanData.color = card.color;
    if (card.border) cleanData.border = card.border;
    if (card.badge) cleanData.badge = card.badge;
    if (card.createdAt) cleanData.createdAt = card.createdAt;
    else cleanData.createdAt = new Date().toISOString();

    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteCardFromFirestore = async (
  userId: string,
  cardId: string
) => {
  const path = `users/${userId}/cards/${cardId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'cards', cardId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const seedInitialCardsIfEmpty = async (
  userId: string,
  cards: CreditCardItem[]
) => {
  const path = `users/${userId}/cards`;
  try {
    const colRef = collection(db, 'users', userId, 'cards');
    const existing = await getDocs(colRef);
    if (existing.empty) {
      const batch = writeBatch(db);
      cards.forEach((card) => {
        const docRef = doc(db, 'users', userId, 'cards', card.id);
        const data: Record<string, any> = {
          name: card.name,
          brand: card.brand,
          userId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (card.limit) data.limit = card.limit;
        if (card.closingDay) data.closingDay = card.closingDay;
        if (card.dueDay) data.dueDay = card.dueDay;
        if (card.color) data.color = card.color;
        if (card.border) data.border = card.border;
        if (card.badge) data.badge = card.badge;
        batch.set(docRef, data);
      });
      await batch.commit();
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};

/* =========================================================================
   CONTAS BANCÁRIAS E CARTEIRAS (Accounts)
   ========================================================================= */

export const subscribeToAccounts = (
  userId: string,
  onSuccess: (accounts: AccountItem[]) => void,
  onError?: (error: Error) => void
) => {
  const path = `users/${userId}/accounts`;
  const colRef = collection(db, 'users', userId, 'accounts');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: AccountItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || '',
          bank: data.bank || undefined,
          type: data.type || 'CHECKING',
          balance: Number(data.balance) || 0,
          color: data.color || undefined,
          icon: data.icon || undefined,
          userId: data.userId || userId,
          createdAt: data.createdAt || undefined,
          updatedAt: data.updatedAt || undefined,
        });
      });
      onSuccess(items);
    },
    (error) => {
      console.error('Erro na sincronização Firestore de contas:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
};

export const saveAccountToFirestore = async (
  userId: string,
  account: AccountItem
) => {
  const path = `users/${userId}/accounts/${account.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'accounts', account.id);
    const cleanData: Record<string, any> = {
      name: account.name.trim().slice(0, 60),
      type: account.type,
      balance: Number(account.balance),
      userId: userId,
      updatedAt: new Date().toISOString(),
    };
    if (account.bank) cleanData.bank = account.bank.trim().slice(0, 40);
    if (account.color) cleanData.color = account.color;
    if (account.icon) cleanData.icon = account.icon;
    if (account.createdAt) cleanData.createdAt = account.createdAt;
    else cleanData.createdAt = new Date().toISOString();

    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteAccountFromFirestore = async (
  userId: string,
  accountId: string
) => {
  const path = `users/${userId}/accounts/${accountId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'accounts', accountId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const seedInitialAccountsIfEmpty = async (
  userId: string,
  accounts: AccountItem[]
) => {
  const path = `users/${userId}/accounts`;
  try {
    const colRef = collection(db, 'users', userId, 'accounts');
    const existing = await getDocs(colRef);
    if (existing.empty) {
      const batch = writeBatch(db);
      accounts.forEach((acc) => {
        const docRef = doc(db, 'users', userId, 'accounts', acc.id);
        const data: Record<string, any> = {
          name: acc.name,
          type: acc.type,
          balance: Number(acc.balance),
          userId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (acc.bank) data.bank = acc.bank;
        if (acc.color) data.color = acc.color;
        if (acc.icon) data.icon = acc.icon;
        batch.set(docRef, data);
      });
      await batch.commit();
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};

/* =========================================================================
   CATEGORIAS (Categories)
   ========================================================================= */

export const subscribeToCategories = (
  userId: string,
  onSuccess: (categories: CategoryItem[]) => void,
  onError?: (error: Error) => void
) => {
  const path = `users/${userId}/categories`;
  const colRef = collection(db, 'users', userId, 'categories');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: CategoryItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || '',
          type: data.type || 'EXPENSE',
          color: data.color || undefined,
          icon: data.icon || undefined,
          budget: data.budget ? Number(data.budget) : undefined,
          userId: data.userId || userId,
          createdAt: data.createdAt || undefined,
          updatedAt: data.updatedAt || undefined,
        });
      });
      onSuccess(items);
    },
    (error) => {
      console.error('Erro na sincronização Firestore de categorias:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
};

export const saveCategoryToFirestore = async (
  userId: string,
  category: CategoryItem
) => {
  const path = `users/${userId}/categories/${category.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'categories', category.id);
    const cleanData: Record<string, any> = {
      name: category.name.trim().slice(0, 60),
      type: category.type,
      userId: userId,
      updatedAt: new Date().toISOString(),
    };
    if (category.color) cleanData.color = category.color;
    if (category.icon) cleanData.icon = category.icon;
    if (category.budget !== undefined) cleanData.budget = Number(category.budget);
    if (category.createdAt) cleanData.createdAt = category.createdAt;
    else cleanData.createdAt = new Date().toISOString();

    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteCategoryFromFirestore = async (
  userId: string,
  categoryId: string
) => {
  const path = `users/${userId}/categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'categories', categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const seedInitialCategoriesIfEmpty = async (
  userId: string,
  categories: CategoryItem[]
) => {
  const path = `users/${userId}/categories`;
  try {
    const colRef = collection(db, 'users', userId, 'categories');
    const existing = await getDocs(colRef);
    if (existing.empty) {
      const batch = writeBatch(db);
      categories.forEach((cat) => {
        const docRef = doc(db, 'users', userId, 'categories', cat.id);
        const data: Record<string, any> = {
          name: cat.name,
          type: cat.type,
          userId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (cat.color) data.color = cat.color;
        if (cat.icon) data.icon = cat.icon;
        if (cat.budget) data.budget = cat.budget;
        batch.set(docRef, data);
      });
      await batch.commit();
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};

/* =========================================================================
   SEED & RESET & ZERAR CONTA
   ========================================================================= */

export const seedInitialTransactionsIfEmpty = async (
  userId: string,
  initialTransactions: Transaction[]
) => {
  const path = `users/${userId}/transactions`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.isZeroed) {
        return false;
      }
    }

    const colRef = collection(db, 'users', userId, 'transactions');
    const existing = await getDocs(colRef);
    if (existing.empty) {
      const batch = writeBatch(db);
      initialTransactions.forEach((tx) => {
        const docRef = doc(db, 'users', userId, 'transactions', tx.id);
        const data: Record<string, any> = {
          description: tx.description,
          amount: Number(tx.amount),
          type: tx.type,
          category: tx.category,
          consolidated: Boolean(tx.consolidated),
          userId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (tx.cardName) data.cardName = tx.cardName;
        if (tx.accountId) data.accountId = tx.accountId;
        if (tx.accountName) data.accountName = tx.accountName;
        if (tx.installmentInfo) data.installmentInfo = tx.installmentInfo;
        batch.set(docRef, data);
      });
      batch.set(userDocRef, { isZeroed: false, initialized: true, updatedAt: new Date().toISOString() }, { merge: true });
      await batch.commit();
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};

export const resetFirestoreTransactions = async (
  userId: string,
  initialTransactions: Transaction[]
) => {
  const path = `users/${userId}/transactions`;
  try {
    const colRef = collection(db, 'users', userId, 'transactions');
    const existing = await getDocs(colRef);
    const batch = writeBatch(db);
    
    existing.forEach((d) => {
      batch.delete(d.ref);
    });

    initialTransactions.forEach((tx) => {
      const docRef = doc(db, 'users', userId, 'transactions', tx.id);
      const data: Record<string, any> = {
        description: tx.description,
        amount: Number(tx.amount),
        type: tx.type,
        category: tx.category,
        consolidated: Boolean(tx.consolidated),
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (tx.cardName) data.cardName = tx.cardName;
      if (tx.accountId) data.accountId = tx.accountId;
      if (tx.accountName) data.accountName = tx.accountName;
      if (tx.installmentInfo) data.installmentInfo = tx.installmentInfo;
      batch.set(docRef, data);
    });

    const userDocRef = doc(db, 'users', userId);
    batch.set(userDocRef, { isZeroed: false, initialized: true, updatedAt: new Date().toISOString() }, { merge: true });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const clearAllFirestoreTransactions = async (userId: string) => {
  const path = `users/${userId}/transactions`;
  try {
    const colRef = collection(db, 'users', userId, 'transactions');
    const existing = await getDocs(colRef);
    const batch = writeBatch(db);
    
    if (!existing.empty) {
      existing.forEach((d) => {
        batch.delete(d.ref);
      });
    }

    const userDocRef = doc(db, 'users', userId);
    batch.set(userDocRef, { isZeroed: true, initialized: true, updatedAt: new Date().toISOString() }, { merge: true });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
