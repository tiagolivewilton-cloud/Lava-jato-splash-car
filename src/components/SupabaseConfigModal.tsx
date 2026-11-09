import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Key, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Terminal, 
  ExternalLink 
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  seedBusinessesToSupabase, 
  isValidSupabaseUrl 
} from '../lib/supabase';
import { SUPABASE_SQL_SETUP } from '../data/mockData';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated: () => void;
  isLive: boolean;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onCredentialsUpdated,
  isLive,
}) => {
  const initial = getSupabaseCredentials();
  const [url, setUrl] = useState(initial.url);
  const [anonKey, setAnonKey] = useState(initial.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSave = () => {
    saveSupabaseCredentials(url, anonKey);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onCredentialsUpdated();
      onClose();
    }, 800);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const res = await seedBusinessesToSupabase();
      if (res.success) {
        setSeedMessage('✓ Estabelecimentos inseridos com sucesso na tabela businesses!');
        onCredentialsUpdated();
      } else {
        setSeedMessage(`Erro ao popular dados: ${res.error}`);
      }
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden text-left space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-950/70 border border-cyan-800/70 text-cyan-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Conexão Supabase & Estrutura SQL
              </h3>
              <p className="text-xs text-slate-400">
                Configure as credenciais e visualize o schema das tabelas <code>businesses</code> e <code>service_orders</code>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status banner */}
        <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
          isLive 
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
            : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
        }`}>
          {isLive ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          )}
          <div className="flex-1">
            <p className="font-bold">
              {isLive ? 'Supabase Conectado e Ativo' : 'Modo Demonstração / Aguardando Chaves'}
            </p>
            <p className="text-slate-300 text-[11px] mt-0.5">
              {isLive
                ? 'As operações de leitura e gravação estão sincronizadas diretamente com seu projeto Supabase.'
                : 'Você pode colar abaixo a URL e a Anon Key do seu painel Supabase para salvar ordens no seu banco real.'}
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              SUPABASE_URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3 h-3 text-cyan-400" />
              SUPABASE_ANON_KEY
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/10 flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Salvo com Sucesso!
                </>
              ) : (
                'Salvar e Conectar'
              )}
            </button>

            {isLive && (
              <button
                type="button"
                onClick={handleSeed}
                disabled={isSeeding}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {isSeeding ? 'Criando dados...' : 'Popular Estabelecimentos de Teste'}
              </button>
            )}
          </div>

          {seedMessage && (
            <p className="text-xs text-cyan-300 font-medium p-2 bg-cyan-950/40 border border-cyan-800/40 rounded-lg">
              {seedMessage}
            </p>
          )}
        </div>

        {/* SQL Schema Section */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Script SQL de Criação das Tabelas
            </span>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar SQL</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Cole este código no <strong>SQL Editor</strong> do painel Supabase para criar as tabelas <code>businesses</code> e <code>service_orders</code> com as permissões RLS.
          </p>

          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
            {SUPABASE_SQL_SETUP}
          </pre>
        </div>
      </div>
    </div>
  );
};
