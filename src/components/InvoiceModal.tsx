import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  DollarSign, 
  Calendar, 
  Plus, 
  AlertCircle, 
  Save, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { Transaction } from '../types';
import { formatMoney } from '../utils/formatters';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardTransaction: Transaction | null;
  allTransactions: Transaction[];
  onUpdateInvoiceAmount: (id: string, newAmount: number) => Promise<void> | void;
  onToggleInvoiceStatus: (id: string) => Promise<void> | void;
  onAddTransactionToCard?: (cardName: string) => void;
  currentMonth: string;
  isDark?: boolean;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  cardTransaction,
  allTransactions,
  onUpdateInvoiceAmount,
  onToggleInvoiceStatus,
  onAddTransactionToCard,
  currentMonth,
  isDark = false,
}) => {
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cardTransaction) {
      setAmountInput(cardTransaction.amount.toFixed(2).replace('.', ','));
      setIsEditingAmount(false);
      setSuccessMsg(null);
    }
  }, [cardTransaction]);

  if (!isOpen || !cardTransaction) return null;

  const cardName = cardTransaction.cardName || cardTransaction.description;
  const isPaid = cardTransaction.consolidated;
  const currentAmount = cardTransaction.amount;

  // Filtrar compras e parcelamentos vinculados a este cartão
  const cardItems = allTransactions.filter(
    (t) => 
      t.id !== cardTransaction.id && 
      (t.cardName === cardName || t.cardName === cardTransaction.description || t.description.toLowerCase().includes(cardName.toLowerCase()))
  );

  const handleSaveAmount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVal = amountInput.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleanVal);
    if (isNaN(parsed) || parsed < 0) {
      alert('Por favor, informe um valor válido para a fatura.');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateInvoiceAmount(cardTransaction.id, parsed);
      setIsEditingAmount(false);
      setSuccessMsg(`Valor da fatura atualizado para ${formatMoney(parsed)}!`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Erro ao atualizar valor da fatura:', err);
      alert('Erro ao atualizar o valor da fatura. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePayment = async () => {
    setIsSaving(true);
    try {
      await onToggleInvoiceStatus(cardTransaction.id);
      setSuccessMsg(
        !isPaid 
          ? 'Fatura marcada como PAGA com sucesso!' 
          : 'Fatura reaberta para PENDENTE!'
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
      <div 
        className={`border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header do Modal da Fatura */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isPaid
                ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200')
                : (isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-200')
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {cardName}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                  isPaid
                    ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                    : (isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200')
                }`}>
                  {isPaid ? 'Fatura Paga' : 'Fatura Aberta'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Fatura de Competência: <strong>{currentMonth}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Fechar Fatura"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificação de Sucesso */}
        {successMsg && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Conteúdo Principal da Fatura */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          
          {/* Card com o Valor da Fatura e Status de Pagamento */}
          <div className={`p-5 rounded-2xl border ${
            isPaid
              ? (isDark ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/60 border-emerald-200')
              : (isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/90')
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Total Atual da Fatura
                </span>

                {!isEditingAmount ? (
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`font-mono text-3xl font-extrabold tracking-tight ${
                      isPaid 
                        ? (isDark ? 'text-emerald-400' : 'text-emerald-700')
                        : (isDark ? 'text-white' : 'text-slate-900')
                    }`}>
                      {formatMoney(currentAmount)}
                    </span>
                    <button
                      onClick={() => setIsEditingAmount(true)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                        isDark 
                          ? 'text-amber-400 hover:bg-amber-500/10' 
                          : 'text-amber-700 hover:bg-amber-100/70'
                      }`}
                      title="Alterar o valor total desta fatura"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Alterar Valor</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveAmount} className="flex items-center gap-2 mt-2">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                      <input
                        type="text"
                        autoFocus
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="0,00"
                        className={`pl-9 pr-3 py-1.5 text-base font-mono font-bold rounded-lg border focus:outline-hidden ${
                          isDark 
                            ? 'bg-slate-950 border-emerald-500 text-white' 
                            : 'bg-white border-emerald-500 text-slate-900'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAmount(false)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Cancelar
                    </button>
                  </form>
                )}
                
                <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isPaid 
                    ? '✓ Esta fatura já foi paga e baixada do seu saldo do mês.' 
                    : '⏳ Fatura pendente de pagamento no fluxo de caixa.'}
                </p>
              </div>

              {/* Botão de Ação: Pagar Fatura */}
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <button
                  type="button"
                  onClick={handleTogglePayment}
                  disabled={isSaving}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer ${
                    isPaid
                      ? (isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300')
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-600/20'
                  }`}
                >
                  {isPaid ? (
                    <>
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Reabrir Fatura (Pendente)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Pagar Fatura Agora</span>
                    </>
                  )}
                </button>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isPaid ? 'Status: Pago' : 'Clique para registrar pagamento'}
                </span>
              </div>
            </div>
          </div>

          {/* Dicas e Informações da Fatura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="flex items-center gap-2 text-slate-500 font-medium mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vencimento da Fatura</span>
              </div>
              <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                10/{currentMonth.includes('/') ? currentMonth.split('/')[0] : '11'}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Fechamento estimado 7 dias antes do vencimento
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="flex items-center gap-2 text-slate-500 font-medium mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gestão sem Rotativo</span>
              </div>
              <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Pagamento Integral Recomendado
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Pagar o total de {formatMoney(currentAmount)} evita juros e multas
              </div>
            </div>
          </div>

          {/* Compras e Parcelamentos vinculados */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <span>Lançamentos Vinculados a este Cartão</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700 font-mono'
                }`}>
                  {cardItems.length}
                </span>
              </h4>

              {onAddTransactionToCard && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAddTransactionToCard(cardName);
                  }}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700' 
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Compra Parcelada</span>
                </button>
              )}
            </div>

            {cardItems.length === 0 ? (
              <div className={`p-4 rounded-xl border text-center text-xs ${
                isDark ? 'bg-slate-800/20 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                Nenhuma compra individual vinculada separadamente. O valor desta fatura ({formatMoney(currentAmount)}) representa o montante consolidado do cartão.
              </div>
            ) : (
              <div className={`border rounded-xl divide-y overflow-hidden ${
                isDark ? 'border-slate-800 divide-slate-800' : 'border-slate-200 divide-slate-100'
              }`}>
                {cardItems.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {item.description}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{item.category}</span>
                        {item.installmentInfo && (
                          <span className="font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                            Parcela {item.installmentInfo.current}/{item.installmentInfo.total}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-rose-500">
                      {formatMoney(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            {!isEditingAmount && (
              <button
                type="button"
                onClick={() => setIsEditingAmount(true)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700' 
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Alterar Valor da Fatura</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleTogglePayment}
              disabled={isSaving}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs ${
                isPaid ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isPaid ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Reabrir Fatura</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pagar Fatura</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
