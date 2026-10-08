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
import { Transaction } from '../types';

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
          installmentInfo: data.installmentInfo || undefined,
          userId: data.userId || userId,
          createdAt: data.createdAt || undefined,
          updatedAt: data.updatedAt || undefined,
        });
      });
      // Sincroniza sempre, inclusive quando a lista estiver zerada (0 lançamentos)
      onSuccess(items);
    },
    (error) => {
      console.error('Erro na sincronização Firestore:', error);
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
    if (transaction.installmentInfo) {
      cleanData.installmentInfo = transaction.installmentInfo;
    }
    if (transaction.createdAt) {
      cleanData.createdAt = transaction.createdAt;
    } else {
      cleanData.createdAt = new Date().toISOString();
    }

    // Marca no perfil que o usuário tem dados ativos
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

/**
 * Popula transações iniciais para um cliente novo apenas na primeira vez,
 * respeitando caso o cliente tenha optado por zerar a conta.
 */
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
      // Se o usuário optou por zerar a conta, não ressuscita dados padrão
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
        if (tx.cardName) {
          data.cardName = tx.cardName;
        }
        if (tx.installmentInfo) {
          data.installmentInfo = tx.installmentInfo;
        }
        batch.set(docRef, data);
      });
      // Marca perfil
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

/**
 * Restaura o modelo padrão inicial
 */
export const resetFirestoreTransactions = async (
  userId: string,
  initialTransactions: Transaction[]
) => {
  const path = `users/${userId}/transactions`;
  try {
    const colRef = collection(db, 'users', userId, 'transactions');
    const existing = await getDocs(colRef);
    const batch = writeBatch(db);
    
    // Deleta os atuais
    existing.forEach((d) => {
      batch.delete(d.ref);
    });

    // Insere os iniciais
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
      if (tx.cardName) {
        data.cardName = tx.cardName;
      }
      if (tx.installmentInfo) {
        data.installmentInfo = tx.installmentInfo;
      }
      batch.set(docRef, data);
    });

    // Marca isZeroed: false no perfil
    const userDocRef = doc(db, 'users', userId);
    batch.set(userDocRef, { isZeroed: false, initialized: true, updatedAt: new Date().toISOString() }, { merge: true });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Zera todos os lançamentos da conta individual do cliente
 */
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

    // Marca isZeroed: true no perfil do usuário para persistir a conta zerada
    const userDocRef = doc(db, 'users', userId);
    batch.set(userDocRef, { isZeroed: true, initialized: true, updatedAt: new Date().toISOString() }, { merge: true });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
