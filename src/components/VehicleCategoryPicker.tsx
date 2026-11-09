import React from 'react';
import { VehicleCategory } from '../types';
import { VEHICLE_CATEGORIES } from '../data/mockData';

interface VehicleCategoryPickerProps {
  selectedCategory: VehicleCategory;
  onSelectCategory: (category: VehicleCategory) => void;
}

export const VehicleCategoryPicker: React.FC<VehicleCategoryPickerProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          1. Categoria do Veículo
        </label>
        <span className="text-xs text-slate-400">
          Ajusta automaticamente os valores e tempos dos serviços
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {VEHICLE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col items-start p-3.5 rounded-xl text-left border transition-all relative overflow-hidden group ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>

              <span className={`text-sm font-bold leading-tight ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                {cat.name}
              </span>

              <span className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-tight">
                {cat.example}
              </span>

              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
