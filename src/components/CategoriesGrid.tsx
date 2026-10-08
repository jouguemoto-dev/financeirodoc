import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  Layers, 
  Edit3, 
  Trash2,
  DollarSign,
  Filter
} from 'lucide-react';
import { CategoryItem, CategoryNature } from '../types';
import { formatMoney } from '../utils/formatters';

interface CategoriesGridProps {
  categories: CategoryItem[];
  onOpenNewCategory: () => void;
  onEditCategory: (category: CategoryItem) => void;
  onDeleteCategory: (id: string) => void;
  isDark?: boolean;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  onOpenNewCategory,
  onEditCategory,
  onDeleteCategory,
  isDark = false,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'BOTH'>('ALL');

  const filtered = categories.filter((c) => {
    if (filterType === 'ALL') return true;
    return c.type === filterType;
  });

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'emerald':
        return {
          dot: 'bg-emerald-500',
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
        };
      case 'teal':
        return {
          dot: 'bg-teal-500',
          badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800/40',
        };
      case 'blue':
        return {
          dot: 'bg-blue-500',
          badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
        };
      case 'cyan':
        return {
          dot: 'bg-cyan-500',
          badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40',
        };
      case 'indigo':
        return {
          dot: 'bg-indigo-500',
          badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
        };
      case 'purple':
        return {
          dot: 'bg-purple-500',
          badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
        };
      case 'pink':
        return {
          dot: 'bg-pink-500',
          badge: 'bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 border-pink-200 dark:border-pink-800/40',
        };
      case 'rose':
        return {
          dot: 'bg-rose-500',
          badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
        };
      case 'orange':
        return {
          dot: 'bg-orange-500',
          badge: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
        };
      case 'amber':
        return {
          dot: 'bg-amber-500',
          badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
        };
      default:
        return {
          dot: 'bg-slate-500',
          badge: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  const getNatureBadge = (type: CategoryNature) => {
    switch (type) {
      case 'EXPENSE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/40">
            <TrendingDown className="w-3 h-3" />
            <span>Despesa</span>
          </span>
        );
      case 'INCOME':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/40">
            <TrendingUp className="w-3 h-3" />
            <span>Receita</span>
          </span>
        );
      case 'BOTH':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
            <Layers className="w-3 h-3" />
            <span>Ambas</span>
          </span>
        );
    }
  };

  return (
    <section className="space-y-4">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-sm font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}>
              Categorias Financeiras
            </h2>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Personalize suas categorias de receitas e despesas e defina tetos orçamentários
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro por tipo */}
          <div className={`p-0.5 rounded-xl border flex items-center text-xs font-semibold ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas ({categories.length})
            </button>
            <button
              onClick={() => setFilterType('EXPENSE')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'EXPENSE'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => setFilterType('INCOME')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'INCOME'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Receitas
            </button>
          </div>

          {/* Botão de Ação: Criar Nova Categoria */}
          <button
            onClick={onOpenNewCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            title="Criar nova categoria financeira"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Categoria</span>
          </button>
        </div>
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {filtered.map((cat) => {
          const colors = getColorClasses(cat.color);

          return (
            <div
              key={cat.id}
              className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all duration-200 group hover:-translate-y-0.5 ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.dot}`} />
                    <span className={`text-xs font-bold tracking-tight truncate ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                      {cat.name}
                    </span>
                  </div>
                </div>

                <div className="mb-2">
                  {getNatureBadge(cat.type)}
                </div>

                {cat.budget ? (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Teto: </span>
                    <strong className="font-mono text-slate-700 dark:text-slate-300">
                      {formatMoney(cat.budget)}
                    </strong>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                    Sem teto limite
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => onEditCategory(cat)}
                  className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Editar categoria"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Deseja excluir a categoria "${cat.name}"?`)) {
                      onDeleteCategory(cat.id);
                    }
                  }}
                  className="text-rose-500 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer opacity-60 group-hover:opacity-100"
                  title="Excluir categoria"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Card de Adição Rápida */}
        <button
          type="button"
          onClick={onOpenNewCategory}
          className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[120px] group ${
            isDark 
              ? 'border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/10 text-slate-400 hover:text-emerald-400' 
              : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-500 hover:text-emerald-600'
          }`}
        >
          <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">Criar Categoria</span>
          <span className="text-[10px] text-slate-400 text-center">
            Adicione uma nova etiqueta
          </span>
        </button>
      </div>
    </section>
  );
};
