import React from 'react';
import { Droplets, Sparkles, Database, ShieldCheck, Car, Clock } from 'lucide-react';
import { Business } from '../types';

interface HeaderProps {
  currentTab: 'schedule' | 'orders';
  onTabChange: (tab: 'schedule' | 'orders') => void;
  selectedBusiness: Business | null;
  isSupabaseLive: boolean;
  onOpenConfig: () => void;
  orderCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  selectedBusiness,
  isSupabaseLive,
  onOpenConfig,
  orderCount = 0,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Droplets className="w-6 h-6 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute -top-1 -right-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                  JATO SPLASH <span className="text-cyan-400">CAR</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                  Pro Care
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Estética Automotiva & Ordens de Serviço
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => onTabChange('schedule')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentTab === 'schedule'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Novo Agendamento</span>
            </button>
            <button
              onClick={() => onTabChange('orders')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentTab === 'orders'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Painel de OS</span>
              {orderCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentTab === 'orders' ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-300'
                }`}>
                  {orderCount}
                </span>
              )}
            </button>
          </div>

          {/* Supabase Connection Status Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenConfig}
              title="Configurações de Conexão Supabase"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseLive ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden md:inline">Supabase:</span>
              <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                isSupabaseLive ? 'text-emerald-400' : 'text-amber-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                {isSupabaseLive ? 'Online (Conectado)' : 'Configurar / SQL'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
