import React from 'react';
import { Check, Clock, Sparkles } from 'lucide-react';
import { SelectedService, ServiceItem, VehicleCategory } from '../types';
import { AVAILABLE_SERVICES } from '../data/mockData';

interface ServiceSelectorProps {
  selectedCategory: VehicleCategory;
  selectedServices: SelectedService[];
  onToggleService: (service: ServiceItem) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selectedCategory,
  selectedServices,
  onToggleService,
  onSelectAll,
  onClearAll,
}) => {
  const isSelected = (serviceId: string) =>
    selectedServices.some((s) => s.id === serviceId);

  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_min, 0);

  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          2. Serviços de Estética & Lavagem
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Selecionar Todos
          </button>
          <span className="text-slate-700" aria-hidden="true">|</span>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-slate-300 font-medium transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AVAILABLE_SERVICES.map((service) => {
          const checked = isSelected(service.id);
          const price = service.prices[selectedCategory];

          return (
            <div
              key={service.id}
              onClick={() => onToggleService(service)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                checked
                  ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        checked
                          ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                          : 'border-slate-700 bg-slate-950'
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <h3 className={`text-sm font-bold ${checked ? 'text-white' : 'text-slate-200'}`}>
                      {service.name}
                    </h3>
                  </div>

                  <span className="text-base font-extrabold text-cyan-400 whitespace-nowrap">
                    R$ {price.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <p className="text-xs text-slate-400 pl-7 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="flex items-center gap-3 pl-7 mt-3 pt-2 border-t border-slate-800/60 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  ~{service.duration_min} min
                </span>
                {service.popular && (
                  <>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <Sparkles className="w-3 h-3" /> Mais Pedido
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected summary bar */}
      <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
        <span className="text-slate-400">
          <strong className="text-white font-semibold">{selectedServices.length}</strong>{' '}
          {selectedServices.length === 1 ? 'serviço selecionado' : 'serviços selecionados'}{' '}
          {totalDuration > 0 && `(~${totalDuration} minutos estimados)`}
        </span>
        <span className="text-slate-300 font-medium">
          Subtotal Serviços:{' '}
          <strong className="text-cyan-400 font-bold text-sm">
            R$ {subtotal.toFixed(2).replace('.', ',')}
          </strong>
        </span>
      </div>
    </div>
  );
};
