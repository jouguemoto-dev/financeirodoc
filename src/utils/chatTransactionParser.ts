import { Transaction, TransactionType, CreditCardItem, CategoryItem, AccountItem } from '../types';
import { KNOWN_CREDIT_CARDS, COMMON_CATEGORIES } from '../data/initialData';

export interface ParsedTransactionResult {
  success: boolean;
  rawText: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  cardName?: string;
  accountName?: string;
  consolidated: boolean;
  date?: string;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
}

// Mapeamento inteligente de palavras-chave para categorias em português
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Alimentação': [
    'almoco', 'almoço', 'jantar', 'lanche', 'cafe', 'café', 'padaria', 'restaurante', 
    'supermercado', 'mercado', 'ifood', 'comida', 'acougue', 'açougue', 'feira', 
    'pao', 'pão', 'mcdonalds', 'burger', 'pizza', 'hamburguer', 'delivery'
  ],
  'Transporte': [
    'uber', '99', 'taxi', 'táxi', 'gasolina', 'combustivel', 'combustível', 'posto', 
    'onibus', 'ônibus', 'metro', 'metrô', 'passagem', 'pedagio', 'pedágio', 'estacionamento',
    'ipva', 'oficina', 'mecanico', 'mecânico'
  ],
  'Moradia': [
    'aluguel', 'condominio', 'condomínio', 'luz', 'energia', 'agua', 'água', 'gas', 'gás', 
    'iptu', 'internet', 'wifi', 'faxina', 'diarista', 'reforma'
  ],
  'Educação': [
    'faculdade', 'escola', 'mensalidade', 'curso', 'livro', 'material', 'apostila', 'shalom', 'colegio', 'colégio'
  ],
  'Saúde': [
    'farmacia', 'farmácia', 'drogaria', 'remedio', 'remédio', 'medico', 'médico', 
    'consulta', 'exame', 'dentista', 'psicologo', 'psicólogo', 'plano de saude', 'unimed'
  ],
  'Lazer': [
    'cinema', 'praia', 'viagem', 'hotel', 'passeio', 'festa', 'bar', 'cerveja', 
    'churrasco', 'show', 'ingresso', 'parque', 'jogos', 'game'
  ],
  'Assinaturas': [
    'netflix', 'spotify', 'amazon', 'prime', 'disney', 'hbo', 'max', 'youtube', 
    'globo', 'apple', 'icloud', 'chatgpt'
  ],
  'Doações': [
    'dizimo', 'dízimo', 'oferta', 'doacao', 'doação', 'igreja', 'caridade'
  ],
  'Telefonia': [
    'celular', 'recarga', 'claro', 'vivo', 'tim', 'oi', 'plano celular', 'telefone'
  ],
  'Vestuário': [
    'roupa', 'camisa', 'tenis', 'tênis', 'sapato', 'calca', 'calça', 'vestido', 'renner', 'zara', 'riachuelo', 'c&a'
  ],
  'Investimentos': [
    'cdb', 'tesouro', 'acoes', 'ações', 'fundos', 'fii', 'cripto', 'bitcoin', 'poupanca', 'poupança'
  ],
  'Renda': [
    'salario', 'salário', 'ordenado', 'proventos', 'remuneracao', 'remuneração', 'adiantamento'
  ],
  'Renda Extra': [
    'freela', 'freelance', 'bico', 'extra', 'venda', 'reembolso', 'premio', 'prêmio', 'ibe'
  ]
};

// Remove acentos e normaliza para busca
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Analisa uma mensagem em português e extrai automaticamente
 * o valor, tipo, descrição, categoria e cartão de crédito.
 * 100% Gratuito, sem necessidade de chaves de API externas ou custos de servidor.
 */
export function parseTransactionFromText(
  input: string,
  availableCards: CreditCardItem[] = [],
  availableCategories: CategoryItem[] = [],
  availableAccounts: AccountItem[] = []
): ParsedTransactionResult {
  const text = input.trim();
  const normalized = normalizeText(text);

  if (!text) {
    return {
      success: false,
      rawText: text,
      description: '',
      amount: 0,
      type: 'EXPENSE',
      category: 'Outros',
      consolidated: false,
      explanation: 'Por favor, digite um texto descrevendo o lançamento.',
      confidence: 'low'
    };
  }

  // 1. Extração do Valor
  let amount = 0;
  let amountMatchStr = '';

  const currencyRegexes = [
    /r\$\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:[.,][0-9]{1,2})?)/i,
    /([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:[.,][0-9]{1,2})?)\s*(?:reais|real|conto)/i,
    /(?:valor|custou|de|por|gastei|paguei|recebi)\s*(?:de\s*)?(?:r\$\s*)?([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:[.,][0-9]{1,2})?)/i,
    /([0-9]+(?:,[0-9]{1,2}))/,
    /\b([0-9]+(?:\.[0-9]{1,2}))\b/,
    /\b([0-9]+)\b/
  ];

  for (const regex of currencyRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      amountMatchStr = match[1];
      let cleaned = amountMatchStr.replace(/\./g, '').replace(',', '.');
      const val = parseFloat(cleaned);
      if (!isNaN(val) && val > 0) {
        amount = val;
        break;
      }
    }
  }

  // 2. Detecção de Cartão de Crédito
  let detectedCard: string | undefined = undefined;
  const cardsToCheck = availableCards.length > 0 ? availableCards : KNOWN_CREDIT_CARDS;

  for (const card of cardsToCheck) {
    const cardNorm = normalizeText(card.name);
    const brandNorm = normalizeText(card.brand || '');
    if (
      normalized.includes(cardNorm) || 
      (brandNorm && (
        normalized.includes(`cartao ${brandNorm}`) ||
        normalized.includes(`cartão ${brandNorm}`) ||
        normalized.includes(`no ${brandNorm}`) ||
        normalized.includes(`no cartao ${brandNorm}`) ||
        normalized.includes(`no cartão ${brandNorm}`)
      ))
    ) {
      detectedCard = card.name;
      break;
    }
  }

  // Se não detectou cartão nominal, mas citou 'cartão' ou 'crédito'
  const isGenericCredit = !detectedCard && (
    normalized.includes('cartao de credito') ||
    normalized.includes('cartão de crédito') ||
    normalized.includes('no credito') ||
    normalized.includes('no crédito') ||
    normalized.includes('no cartao') ||
    normalized.includes('no cartão')
  );

  if (isGenericCredit) {
    detectedCard = cardsToCheck[0]?.name || 'Cartão Neon';
  }

  // 2.1 Detecção de Conta Bancária / Carteira
  let detectedAccount: string | undefined = undefined;
  for (const acc of availableAccounts) {
    const accNorm = normalizeText(acc.name);
    const bankNorm = normalizeText(acc.bank || '');
    if (
      normalized.includes(accNorm) ||
      (bankNorm && (normalized.includes(`no ${bankNorm}`) || normalized.includes(`pelo ${bankNorm}`) || normalized.includes(`via ${bankNorm}`)))
    ) {
      detectedAccount = acc.name;
      break;
    }
  }

  // 3. Detecção de Tipo: INCOME (Receita), CREDIT (Cartão), ou EXPENSE (Despesa)
  let type: TransactionType = 'EXPENSE';
  
  const incomeKeywords = [
    'recebi', 'recebimento', 'salario', 'salário', 'ganhei', 'renda', 'pix recebido', 
    'vendi', 'entrada', 'proventos', 'pagamento de cliente', 'caiu na conta', 'adiantamento'
  ];
  const isIncome = incomeKeywords.some(kw => normalized.includes(kw));

  if (isIncome) {
    type = 'INCOME';
  } else if (detectedCard) {
    type = 'CREDIT';
  } else {
    type = 'EXPENSE';
  }

  // 4. Detecção de Categoria
  let category = type === 'INCOME' ? 'Renda' : (type === 'CREDIT' ? 'Cartão de Crédito' : 'Outros');

  // Verificar categorias customizadas cadastradas pelo usuário
  for (const cat of availableCategories) {
    const catNorm = normalizeText(cat.name);
    if (normalized.includes(catNorm)) {
      category = cat.name;
      break;
    }
  }

  // Verificar categorias por palavras-chave mapeadas
  if (category === 'Outros' || category === 'Cartão de Crédito') {
    for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => normalized.includes(kw))) {
        category = catName;
        break;
      }
    }
  }

  // 5. Extração e Limpeza da Descrição
  let cleanDesc = text;

  // Remove valores monetários
  cleanDesc = cleanDesc.replace(/r\$\s*[0-9]+(?:[.,][0-9]+)?/gi, '');
  cleanDesc = cleanDesc.replace(/[0-9]+(?:[.,][0-9]+)?\s*(?:reais|real|conto)/gi, '');
  if (amountMatchStr) {
    cleanDesc = cleanDesc.replace(new RegExp(`\\b${amountMatchStr.replace('.', '\\.')}\\b`, 'g'), '');
  }

  // Remove palavras de ligação comuns
  cleanDesc = cleanDesc.replace(/\b(?:gastei|paguei|comprei|recebi|no|na|de|por|com|valor|custou|reais|real|no cartao|no cartão|cartao|cartão|credito|crédito)\b/gi, ' ');
  
  // Remove menção a cartões identificados
  if (detectedCard) {
    cleanDesc = cleanDesc.replace(new RegExp(detectedCard.replace('Cartão ', ''), 'gi'), '');
    cleanDesc = cleanDesc.replace(/neon|inter|credicard|digio|mercado livre|nubank|c6|santander/gi, '');
  }

  cleanDesc = cleanDesc.replace(/\s+/g, ' ').trim();

  // Se a descrição ficou vazia, utiliza a categoria ou termo reconhecido
  if (!cleanDesc || cleanDesc.length < 2) {
    if (category && category !== 'Outros') {
      cleanDesc = category;
    } else if (type === 'INCOME') {
      cleanDesc = 'Receita diversa';
    } else if (type === 'CREDIT') {
      cleanDesc = `Compra no ${detectedCard || 'Cartão'}`;
    } else {
      cleanDesc = 'Lançamento financeiro';
    }
  } else {
    // Capitaliza primeira letra
    cleanDesc = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
  }

  // 6. Confirmação de status consolidado
  const consolidated = type === 'INCOME' || (normalized.includes('pago') || normalized.includes('paguei') || normalized.includes('debitado') || normalized.includes('pix'));

  const success = amount > 0;
  const confidence = (amount > 0 && cleanDesc.length > 2) ? 'high' : (amount > 0 ? 'medium' : 'low');

  const explanation = success
    ? `Entendi: ${type === 'INCOME' ? 'Receita' : (type === 'CREDIT' ? 'Compra no Cartão' : 'Despesa')} de R$ ${amount.toFixed(2).replace('.', ',')} para "${cleanDesc}" na categoria "${category}"${detectedCard ? ` (${detectedCard})` : ''}${detectedAccount ? ` [${detectedAccount}]` : ''}.`
    : 'Não consegui identificar o valor em reais. Tente digitar algo como "Almoço 35 reais no Cartão Nubank" ou "Salário 2500".';

  return {
    success,
    rawText: text,
    description: cleanDesc,
    amount,
    type,
    category,
    cardName: detectedCard,
    accountName: detectedAccount,
    consolidated,
    explanation,
    confidence
  };
}

export const QUICK_CHAT_SUGGESTIONS = [
  'Almoço 42,50 no Cartão Neon',
  'Salário 3200 recebido',
  'Gasolina 120 reais no Inter',
  'Farmácia 65,90',
  'Uber 24 reais no crédito',
  'Mercado 285 reais no Credicard',
  'Internet 99,90 pago',
  'Freelance 500 reais',
];

