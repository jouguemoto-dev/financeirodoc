import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Check, 
  X, 
  PlusCircle, 
  ArrowRight, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { parseTransactionFromText, ParsedTransactionResult, QUICK_CHAT_SUGGESTIONS } from '../utils/chatTransactionParser';
import { formatCurrency } from '../utils/formatters';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  parsedResult?: ParsedTransactionResult;
  launchedTx?: Transaction;
}

interface ChatTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void> | void;
  isDark: boolean;
}

export const ChatTransactionModal: React.FC<ChatTransactionModalProps> = ({
  isOpen,
  onClose,
  onLaunchTransaction,
  isDark,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Olá! Sou o seu Assistente de Lançamentos 100% Gratuito. 💬\n\nBasta me mandar uma mensagem como:\n• "Almoço 35,00"\n• "Gasolina 150 no Cartão Neon"\n• "Recebi freela 450,00"\n\nEu identifico o valor, categoria e cartão e já lanço para você!',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent) return;

    setInputText('');

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Análise inteligente gratuita e imediata no próprio navegador
    const parsed = parseTransactionFromText(messageContent);

    setTimeout(() => {
      const assistantMsgId = `ast_${Date.now()}`;
      let replyText = '';

      if (parsed.success) {
        replyText = `Entendi perfeitamente! 🎯\n${parsed.explanation}\n\nDeseja confirmar e lançar no seu controle financeiro?`;
      } else {
        replyText = `Ops, não consegui identificar todos os dados. 🤔\n${parsed.explanation}\n\nExemplo que funciona: "Mercado 85,90" ou "Uber 23,50".`;
      }

      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        parsedResult: parsed,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    }, 250);
  };

  const handleConfirmLaunch = async (msgId: string, parsed: ParsedTransactionResult) => {
    setIsLaunching(true);
    try {
      const newTxData: Omit<Transaction, 'id'> = {
        description: parsed.description,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        consolidated: parsed.consolidated,
        cardName: parsed.cardName,
        date: parsed.date || new Date().toISOString().split('T')[0],
      };

      await onLaunchTransaction(newTxData);

      // Atualiza a mensagem marcando como lançado
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msgId) {
            return {
              ...m,
              launchedTx: {
                id: 'launched',
                ...newTxData,
              },
            };
          }
          return m;
        })
      );

      // Adiciona mensagem de sucesso do assistente
      const successMsg: ChatMessage = {
        id: `suc_${Date.now()}`,
        sender: 'assistant',
        text: `✅ Pronto! Lançamento de ${formatCurrency(parsed.amount)} em "${parsed.description}" cadastrado com sucesso no seu extrato! 🎉`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, successMsg]);
    } catch (e) {
      console.error('Erro ao lançar pelo chat:', e);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'assistant',
        text: 'Chat limpo! Me envie qualquer novo gasto ou ganho para lançar agora mesmo. 100% gratuito e rápido! ⚡',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs no-print animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-lg rounded-2xl shadow-2xl flex flex-col h-[90vh] sm:h-[80vh] max-h-[700px] border transition-colors ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Cabeçalho do Chat */}
        <div className={`flex items-center justify-between px-4 py-3.5 border-b shrink-0 ${
          isDark ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-200 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  Lançamento por Chat
                </h3>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  GRÁTIS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Assistente de IA integrado • Sem limites
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className={`p-2 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ${
                isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
              title="Limpar histórico de mensagens"
              aria-label="Limpar chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-rose-500 ${
                isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
              title="Fechar janela"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo de Mensagens */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 text-sm">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 shadow-xs whitespace-pre-wrap ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : isDark
                        ? 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-xs'
                        : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="leading-relaxed text-xs sm:text-sm">{msg.text}</p>

                  {/* Card de Transação Identificada para Confirmação Imediata */}
                  {msg.parsedResult && msg.parsedResult.success && (
                    <div className={`mt-3 pt-3 border-t rounded-xl p-2.5 sm:p-3 space-y-2 ${
                      isDark 
                        ? 'bg-slate-900/90 border-slate-700 text-slate-200' 
                        : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {msg.parsedResult.type === 'INCOME' ? (
                            <span className="p-1 rounded bg-emerald-500/10 text-emerald-500 shrink-0">
                              <TrendingUp className="w-3.5 h-3.5" />
                            </span>
                          ) : msg.parsedResult.type === 'CREDIT' ? (
                            <span className="p-1 rounded bg-amber-500/10 text-amber-500 shrink-0">
                              <CreditCard className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="p-1 rounded bg-rose-500/10 text-rose-500 shrink-0">
                              <TrendingDown className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <span className="font-bold text-xs sm:text-sm truncate">
                            {msg.parsedResult.description}
                          </span>
                        </div>
                        <span className={`text-xs sm:text-sm font-extrabold shrink-0 ${
                          msg.parsedResult.type === 'INCOME' 
                            ? 'text-emerald-500' 
                            : msg.parsedResult.type === 'CREDIT' 
                              ? 'text-amber-500' 
                              : 'text-rose-500'
                        }`}>
                          {formatCurrency(msg.parsedResult.amount)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                          📁 {msg.parsedResult.category}
                        </span>
                        {msg.parsedResult.cardName && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                            💳 {msg.parsedResult.cardName}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                          {msg.parsedResult.consolidated ? '✓ Pago / Consolidado' : '⏳ Pendente'}
                        </span>
                      </div>

                      {/* Botão de Confirmação */}
                      {msg.launchedTx ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Lançamento cadastrado com sucesso!</span>
                        </div>
                      ) : (
                        <div className="pt-1.5 flex items-center gap-2">
                          <button
                            onClick={() => handleConfirmLaunch(msg.id, msg.parsedResult!)}
                            disabled={isLaunching}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmar e Lançar Agora</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Sugestões Rápidas de Exemplo (Clique e envie sem esforço) */}
        <div className={`px-3 py-2 border-t overflow-x-auto no-scrollbar shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200/80 bg-slate-50'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              Sugestões:
            </span>
            {QUICK_CHAT_SUGGESTIONS.slice(0, 4).map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(sug)}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Barra de Digitação */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }} 
          className={`p-3 border-t flex items-center gap-2 shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ex: Almoço 35,00 ou Uber 18,90..."
            className={`flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border outline-none transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500'
            }`}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
            title="Enviar mensagem"
            aria-label="Enviar"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
