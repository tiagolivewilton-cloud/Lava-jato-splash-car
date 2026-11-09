import React from 'react';
import { Car, Key, Crown, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import { FulfillmentType } from '../types';

interface FulfillmentPickerProps {
  selectedFulfillment: FulfillmentType;
  onSelectFulfillment: (type: FulfillmentType) => void;
  hasMobileVipUnit: boolean;
  businessName?: string;
}

export const FULFILLMENT_FEES: Record<FulfillmentType, number> = {
  patio: 0,
  valet: 25.0,
  vip_mobile: 45.0,
};

export const FulfillmentPicker: React.FC<FulfillmentPickerProps> = ({
  selectedFulfillment,
  onSelectFulfillment,
  hasMobileVipUnit,
  businessName = 'o estabelecimento',
}) => {
  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          3. Modalidade de Atendimento (Fulfillment)
        </label>
        <span className="text-xs text-slate-400">
          Escolha como deseja receber o serviço
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. PÁTIO */}
        <div
          onClick={() => onSelectFulfillment('patio')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedFulfillment === 'patio'
              ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-lg bg-blue-950/70 border border-blue-800/60 text-blue-400">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
                Sem Taxa Extra
              </span>
            </div>

            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              🚗 Pátio Presencial
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Você traz e retira seu veículo em nosso pátio. Sala de espera climatizada com café espresso e Wi-Fi.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Taxa de deslocamento</span>
            <span className="font-bold text-slate-200">Grátis (R$ 0,00)</span>
          </div>
        </div>

        {/* 2. VALET */}
        <div
          onClick={() => onSelectFulfillment('valet')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedFulfillment === 'valet'
              ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-lg bg-amber-950/70 border border-amber-800/60 text-amber-400">
                <Key className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded">
                + R$ 25,00
              </span>
            </div>

            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              🔑 Valet Leva & Traz
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Motorista profissional credenciado e segurado retira o veículo no seu endereço e devolve impecável.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Taxa de Valet</span>
            <span className="font-bold text-slate-200">+ R$ 25,00</span>
          </div>
        </div>

        {/* 3. VIP MOBILE (UNIDADE MÓVEL) */}
        {hasMobileVipUnit ? (
          // Active state when has_mobile_vip_unit is TRUE
          <div
            onClick={() => onSelectFulfillment('vip_mobile')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
              selectedFulfillment === 'vip_mobile'
                ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/15 ring-1 ring-cyan-400'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
            }`}
          >
            {/* VIP badge header */}
            <div className="absolute top-0 right-0">
              <span className="inline-block bg-gradient-to-l from-cyan-500 to-blue-600 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl-lg tracking-wider">
                Exclusivo
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2.5 rounded-lg bg-purple-950/70 border border-purple-800/60 text-purple-400">
                  <Crown className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded mr-16">
                  + R$ 45,00
                </span>
              </div>

              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                👑 OS VIP (No Local)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Nossa van estúdio vai até sua residência ou empresa. Equipamento 100% autônomo com água purificada e eletricidade.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Taxa Deslocamento VIP</span>
              <span className="font-bold text-cyan-300">+ R$ 45,00</span>
            </div>
          </div>
        ) : (
          // Visually DISABLED state when has_mobile_vip_unit is FALSE (Requirement #3)
          <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-950/70 opacity-60 cursor-not-allowed flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2.5 rounded-lg bg-slate-900 text-slate-500 border border-slate-800">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <span className="text-[10px] uppercase font-bold text-red-400 bg-red-950/40 border border-red-900/50 px-2 py-0.5 rounded">
                  Indisponível neste local
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                👑 OS VIP (No Local)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Nossa van estúdio móvel até o seu endereço residencial ou corporativo.
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/40 text-xs text-slate-500 flex items-center justify-between">
              <span>Status</span>
              <span className="font-semibold text-slate-500">Desativado</span>
            </div>
          </div>
        )}
      </div>

      {/* Prominent explanation when has_mobile_vip_unit is FALSE (Requirement #3) */}
      {!hasMobileVipUnit && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Modalidade VIP Móvel Desativada
                </h4>
                <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                  O estabelecimento selecionado (<strong>{businessName}</strong>) não possui unidade móvel VIP cadastrada no momento.
                </p>
              </div>

              <div className="pt-2 border-t border-amber-800/40">
                <p className="text-xs text-amber-100 font-medium mb-2">
                  💡 Sugestão para o seu atendimento:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectFulfillment('patio')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedFulfillment === 'patio'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    Agendar no Pátio (Sem Taxa)
                    {selectedFulfillment === 'patio' && <span className="text-[10px] ml-1">✓ Selecionado</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectFulfillment('valet')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedFulfillment === 'valet'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    Solicitar Valet (+ R$ 25,00)
                    {selectedFulfillment === 'valet' && <span className="text-[10px] ml-1">✓ Selecionado</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
