import { Transaction, TransactionType } from '../types';
import { KNOWN_CREDIT_CARDS, COMMON_CATEGORIES } from '../data/initialData';

export interface ParsedTransactionResult {
  success: boolean;
  rawText: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  cardName?: string;
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
    'celular', 'recarga', 'tim', 'vivo', 'claro', 'oi'
  ],
  'Vestuário': [
    'roupa', 'camisa', 'tenis', 'tênis', 'sapato', 'calca', 'calça', 'loja', 'vestido'
  ],
  'Investimentos': [
    'investimento', 'cdb', 'selic', 'acoes', 'ações', 'fundo', 'poupanca', 'poupança', 'cripto'
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
export function parseTransactionFromText(input: string): ParsedTransactionResult {
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
  // Aceita formatos: R$ 50,00 | R$50 | 50,50 | 50.50 | 50 reais | 1.250,00 | 1250
  let amount = 0;
  let amountMatchStr = '';

  // Regex para capturar padrões numéricos como R$ 1.234,56 ou 50,00 ou 50 reais
  const currencyRegexes = [
    /r\$\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:[.,][0-9]{1,2})?)/i,
    /([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:[.,][0-9]{1,2})?)\s*(?:reais|real|conto)/i,
    /(?:valor|custou|de|por|gastei|paguei|recebi)\s*(?:de\s*)?(?:r\$\s*)?([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:[.,][0-9]{1,2})?)/i,
    /([0-9]+(?:,[0-9]{1,2}))/, // Qualquer 50,00
    /\b([0-9]+(?:\.[0-9]{1,2}))\b/, // 50.00
    /\b([0-9]+)\b/ // Número solto
  ];

  for (const regex of currencyRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      amountMatchStr = match[1];
      // Normalizar número brasileiro (pontos como milhar, vírgula como decimal)
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
  for (const card of KNOWN_CREDIT_CARDS) {
    const cardNorm = normalizeText(card.name);
    const brandNorm = normalizeText(card.brand);
    if (
      normalized.includes(cardNorm) || 
      normalized.includes(`cartao ${brandNorm}`) ||
      normalized.includes(`cartão ${brandNorm}`) ||
      normalized.includes(`no ${brandNorm}`) ||
      normalized.includes(`no cartao ${brandNorm}`) ||
      normalized.includes(`no cartão ${brandNorm}`)
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
    detectedCard = 'Cartão Neon'; // Primeiro cartão padrão do app
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

  // Busca por categorias conhecidas e suas palavras-chave
  let matchedKeyword = '';
  for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const found = keywords.find(kw => normalized.includes(kw));
    if (found) {
      category = catName;
      matchedKeyword = found;
      // Se a categoria é de renda e o tipo ainda é despesa, ajusta para renda
      if (catName === 'Renda' || catName === 'Renda Extra') {
        type = 'INCOME';
      }
      break;
    }
  }

  // 5. Extração de Descrição Limpa
  // Remove expressões auxiliares para deixar uma descrição profissional
  let cleanDesc = text;
  
  // Remove valor da descrição
  if (amountMatchStr) {
    cleanDesc = cleanDesc.replace(new RegExp(`(r\\$\\s*)?${amountMatchStr.replace('.', '\\.')}(\\s*reais)?`, 'gi'), '');
  }
  
  // Remove termos comuns de comando como "comprei", "gastei com", "paguei", "recebi", "no cartão...", "lançar..."
  const removePatterns = [
    /\b(lancar|lançar|anotar|cadastrar|adicionar|registar|registrar|novo lancamento|novo lançamento)\b/gi,
    /\b(comprei|gastei|paguei|recebi|ganhei|dei|fiz um pix|pix para|transferi|gasto com|compra de|pagamento de)\b/gi,
    /\b(no cartao neon|no cartao inter|no cartao credicard|no cartao digio|no cartao mercado livre)\b/gi,
    /\b(no cartão neon|no cartão inter|no cartão credicard|no cartão digio|no cartão mercado livre)\b/gi,
    /\b(cartao neon|cartao inter|cartao credicard|cartao digio|cartao mercado livre)\b/gi,
    /\b(cartão neon|cartão inter|cartão credicard|cartão digio|cartão mercado livre)\b/gi,
    /\b(no cartao de credito|no cartao de crédito|no cartão de crédito|no cartao|no cartão|no credito|no crédito)\b/gi,
    /\b(no debito|no débito|no pix|em dinheiro|a vista|à vista)\b/gi,
    /\b(hoje|ontem|agora)\b/gi,
    /\b(reais|real|conto)\b/gi
  ];

  for (const pat of removePatterns) {
    cleanDesc = cleanDesc.replace(pat, '');
  }

  // Limpeza de pontuações soltas e espaços múltiplos
  cleanDesc = cleanDesc.replace(/[-–—,:;]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Se a descrição ficou vazia, adota a categoria ou a palavra-chave encontrada
  if (!cleanDesc || cleanDesc.length < 2) {
    cleanDesc = matchedKeyword 
      ? matchedKeyword.charAt(0).toUpperCase() + matchedKeyword.slice(1)
      : (category !== 'Outros' ? category : (type === 'INCOME' ? 'Receita Diversa' : 'Despesa Geral'));
  } else {
    // Primeira letra maiúscula
    cleanDesc = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
  }

  // Se o tipo for CREDIT mas a categoria foi identificada especificamente (ex: Alimentação),
  // mantemos ou associamos.
  if (type === 'CREDIT' && category === 'Outros') {
    category = 'Cartão de Crédito';
  }

  // Status consolidado: Se disse "pago", "já paguei", "liquidado", "consolidado", ou se for dinheiro/pix
  const isAlreadyPaid = (
    normalized.includes('ja paguei') ||
    normalized.includes('já paguei') ||
    normalized.includes('pago') ||
    normalized.includes('liquidado') ||
    normalized.includes('debitado') ||
    normalized.includes('no pix') ||
    type === 'INCOME'
  );

  const consolidated = type === 'CREDIT' ? false : isAlreadyPaid;

  const confidence = amount > 0 ? 'high' : 'medium';
  
  let explanation = '';
  if (amount > 0) {
    const formattedAmount = amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (type === 'INCOME') {
      explanation = `Identifiquei uma receita de ${formattedAmount} em "${category}" (${cleanDesc}).`;
    } else if (type === 'CREDIT') {
      explanation = `Identifiquei um gasto no ${detectedCard || 'Cartão'} de ${formattedAmount} (${cleanDesc}).`;
    } else {
      explanation = `Identifiquei uma despesa de ${formattedAmount} em "${category}" (${cleanDesc}).`;
    }
  } else {
    explanation = 'Não consegui identificar o valor com exatidão. Por favor, especifique o valor (ex: "Almoço 35,00").';
  }

  return {
    success: amount > 0,
    rawText: text,
    description: cleanDesc,
    amount,
    type,
    category,
    cardName: detectedCard,
    consolidated,
    date: new Date().toISOString().split('T')[0],
    explanation,
    confidence
  };
}

/**
 * Exemplos rápidos prontos para o usuário clicar e testar sem digitar nada
 */
export const QUICK_CHAT_SUGGESTIONS = [
  'Almoço restaurante 38,50 no débito',
  'Gasolina 150,00 no Cartão Neon',
  'Supermercado 240,00',
  'Salário 3.200,00',
  'Uber para o trabalho 24,90',
  'Farmácia remédios 65,00 no Cartão Inter',
  'Venda de desapego 120,00 pix recebido'
];
