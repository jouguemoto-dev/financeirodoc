import React, { useState, useEffect } from 'react';
import { X, Tag, Check, Trash2, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { CategoryItem, CategoryNature } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: {
    id?: string;
    name: string;
    type: CategoryNature;
    color?: string;
    budget?: number;
  }) => void;
  onDelete?: (id: string) => void;
  editingCategory?: CategoryItem | null;
  isDark?: boolean;
}

const CATEGORY_COLORS = [
  { name: 'Esmeralda (Verde)', key: 'emerald', class: 'bg-emerald-500' },
  { name: 'Teal (Azul-Petróleo)', key: 'teal', class: 'bg-teal-500' },
  { name: 'Azul', key: 'blue', class: 'bg-blue-500' },
  { name: 'Ciano', key: 'cyan', class: 'bg-cyan-500' },
  { name: 'Índigo', key: 'indigo', class: 'bg-indigo-500' },
  { name: 'Roxo', key: 'purple', class: 'bg-purple-500' },
  { name: 'Rosa', key: 'pink', class: 'bg-pink-500' },
  { name: 'Fúcsia', key: 'fuchsia', class: 'bg-fuchsia-500' },
  { name: 'Vermelho / Rose', key: 'rose', class: 'bg-rose-500' },
  { name: 'Laranja', key: 'orange', class: 'bg-orange-500' },
  { name: 'Âmbar (Amarelo)', key: 'amber', class: 'bg-amber-500' },
  { name: 'Grafite', key: 'slate', class: 'bg-slate-600' },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingCategory,
  isDark = false,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryNature>('EXPENSE');
  const [color, setColor] = useState('emerald');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setType(editingCategory.type);
      setColor(editingCategory.color || 'emerald');
      setBudget(editingCategory.budget ? editingCategory.budget.toString() : '');
    } else {
      setName('');
      setType('EXPENSE');
      setColor('emerald');
      setBudget('');
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numBudget = budget ? parseFloat(budget.replace(',', '.')) : undefined;

    onSave({
      id: editingCategory ? editingCategory.id : undefined,
      name: name.trim(),
      type,
      color,
      budget: numBudget && !isNaN(numBudget) && numBudget > 0 ? numBudget : undefined,
    });

    onClose();
  };

  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs no-print">
      <div 
        className={`border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[94vh] flex flex-col transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingCategory ? 'Editar Categoria' : 'Criar Nova Categoria'}
              </h3>
              <p className="text-xs text-slate-500">
                Organize e controle seus lançamentos por tipo e teto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Nome da Categoria */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Nome da Categoria *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Supermercado, Combustível, Pets, Farmácia, Salário"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-hidden font-medium transition-all ${inputClass}`}
            />
          </div>

          {/* Tipo de Categoria */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Natureza da Categoria
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  type === 'EXPENSE'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold shadow-2xs'
                    : isDark
                    ? 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <span className="text-xs">Despesa</span>
              </button>

              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  type === 'INCOME'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                    : isDark
                    ? 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs">Receita</span>
              </button>

              <button
                type="button"
                onClick={() => setType('BOTH')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  type === 'BOTH'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-2xs'
                    : isDark
                    ? 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Layers className="w-4 h-4 text-blue-500" />
                <span className="text-xs">Ambas</span>
              </button>
            </div>
          </div>

          {/* Meta / Orçamento Teto Mensal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Teto de Gasto Mensal (R$) <span className="normal-case text-[11px] font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ex: 800,00 (deixe em branco se livre)"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-hidden font-mono font-medium transition-all ${inputClass}`}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Útil para acompanhar limites de consumo em gráficos e alertas.
            </p>
          </div>

          {/* Cor de Identificação */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Cor de Identificação
            </label>
            <div className="flex flex-wrap gap-2.5 items-center">
              {CATEGORY_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setColor(c.key)}
                  className={`w-7 h-7 rounded-full ${c.class} transition-all flex items-center justify-center cursor-pointer ${
                    color === c.key
                      ? 'ring-3 ring-offset-2 ring-emerald-500 ring-offset-white dark:ring-offset-slate-900 scale-110 shadow-xs'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  title={c.name}
                >
                  {color === c.key && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Prévia da Categoria */}
          <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
            <span className="text-xs text-slate-500">Prévia da Etiqueta:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
              <span className={`w-2 h-2 rounded-full ${CATEGORY_COLORS.find(c => c.key === color)?.class || 'bg-emerald-500'}`} />
              <span>{name || 'Nova Categoria'}</span>
            </span>
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {editingCategory && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Deseja realmente excluir a categoria "${editingCategory.name}"?`)) {
                    onDelete(editingCategory.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{editingCategory ? 'Salvar Categoria' : 'Criar Categoria'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
