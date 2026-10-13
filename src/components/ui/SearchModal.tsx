import React, { useState, useMemo } from 'react';
import { Product, DepartmentId } from '../../types/store';
import { PRODUCTS } from '../../data/products';
import { Search, X, ArrowUpRight, Compass } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import { formatNaira } from '../../utils/currency';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onJumpToDepartment: (dept: DepartmentId) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onJumpToDepartment,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<DepartmentId>('all');

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesDept = selectedDept === 'all' || p.department === selectedDept;
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      return matchesDept && matchesQuery;
    });
  }, [query, selectedDept]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
        {/* Top Search Input */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-800">
          <Search className="w-5 h-5 text-yellow-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Christian Dopeclub, Shower Girl, Slaver Girl..."
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none font-medium"
          />
          <button
            onClick={() => {
              soundManager.playClick(600);
              onClose();
            }}
            aria-label="Close search"
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 rounded-lg transition-colors border border-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900/70 border-b border-neutral-800 text-xs">
          {(['all', 'clothing', 'shoes', 'caps'] as DepartmentId[]).map((dept) => {
            const labels: Record<DepartmentId, string> = {
              all: 'All Pieces',
              clothing: 'Clothing Rail',
              shoes: 'Shoes & Shelves',
              caps: 'Caps & Headwear'
            };
            return (
              <button
                key={dept}
                onClick={() => {
                  soundManager.playClick(800);
                  setSelectedDept(dept);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-yellow-400 text-neutral-950 shadow-sm font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {labels[dept]}
              </button>
            );
          })}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              No matching products found for "{query}".
            </div>
          ) : (
            filteredProducts.map((p) => {
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 rounded-2xl transition-all duration-150 group"
                >
                  <div
                    className="flex items-center gap-3.5 flex-1 cursor-pointer"
                    onClick={() => {
                      soundManager.playClick(900);
                      onSelectProduct(p);
                      onClose();
                    }}
                  >
                    <img
                      src={p.cutoutUrl}
                      alt={p.name}
                      className="w-12 h-12 object-contain drop-shadow-md shrink-0 bg-neutral-950 rounded-xl p-1 border border-neutral-800"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors truncate">
                          {p.name}
                        </h3>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {p.sku}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate">{p.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pl-4">
                    <span className="font-mono text-xs font-black text-yellow-400 tabular-nums">
                      {formatNaira(p.price)}
                    </span>

                    <button
                      onClick={() => {
                        soundManager.playClick(750);
                        onJumpToDepartment(p.department);
                        onClose();
                      }}
                      title="Jump camera to this zone in 3D"
                      className="p-2 text-neutral-400 hover:text-yellow-400 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playClick(900);
                        onSelectProduct(p);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-md"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-neutral-950" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
