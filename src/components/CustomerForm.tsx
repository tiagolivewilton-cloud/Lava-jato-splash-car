import React from 'react';
import { Phone, User, Calendar, Clock, MapPin, MessageSquare, CarFront } from 'lucide-react';
import { FulfillmentType } from '../types';

interface CustomerFormData {
  customer_whatsapp: string;
  customer_name: string;
  vehicle_model: string;
  vehicle_plate: string;
  address: string;
  scheduled_date: string;
  scheduled_time: string;
  notes: string;
}

interface CustomerFormProps {
  data: CustomerFormData;
  onChange: (field: keyof CustomerFormData, value: string) => void;
  fulfillmentType: FulfillmentType;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  data,
  onChange,
  fulfillmentType,
}) => {
  // Brazilian phone formatting helper
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 2 && raw.length <= 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    } else if (raw.length > 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
    }
    onChange('customer_whatsapp', formatted);
  };

  const isAddressRequired = fulfillmentType === 'valet' || fulfillmentType === 'vip_mobile';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          4. Seus Dados & Agendamento
        </label>
        <span className="text-xs text-slate-400">
          Necessário para contato e confirmação
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* WhatsApp Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            WhatsApp para Notificações *
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              placeholder="(11) 98765-4321"
              value={data.customer_whatsapp}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Receberá a confirmação da OS diretamente neste número.
          </p>
        </div>

        {/* Customer Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Nome do Cliente *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Carlos Eduardo"
            value={data.customer_name}
            onChange={(e) => onChange('customer_name', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Vehicle Model & Plate */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <CarFront className="w-3.5 h-3.5 text-cyan-400" />
            Modelo do Veículo
          </label>
          <input
            type="text"
            placeholder="Ex: Honda Civic G10 Preto"
            value={data.vehicle_model}
            onChange={(e) => onChange('vehicle_model', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <CarFront className="w-3.5 h-3.5 text-cyan-400" />
            Placa do Veículo
          </label>
          <input
            type="text"
            placeholder="Ex: ABC-1234 ou BRA2E19"
            value={data.vehicle_plate}
            onChange={(e) => onChange('vehicle_plate', e.target.value.toUpperCase())}
            maxLength={8}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Data Preferida
          </label>
          <input
            type="date"
            value={data.scheduled_date}
            onChange={(e) => onChange('scheduled_date', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Horário Preferido
          </label>
          <select
            value={data.scheduled_time}
            onChange={(e) => onChange('scheduled_time', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          >
            <option value="08:00">08:00 - Manhã</option>
            <option value="09:30">09:30 - Manhã</option>
            <option value="11:00">11:00 - Manhã</option>
            <option value="13:30">13:30 - Tarde</option>
            <option value="15:00">15:00 - Tarde</option>
            <option value="16:30">16:30 - Fim de Tarde</option>
          </select>
        </div>

        {/* Address (conditional / emphasized for Valet & VIP) */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Endereço para Atendimento {isAddressRequired ? '*' : '(Opcional se Pátio)'}
            </span>
            {isAddressRequired && (
              <span className="text-[10px] text-cyan-400 font-medium">
                Obrigatório para {fulfillmentType === 'valet' ? 'Valet' : 'OS VIP no Local'}
              </span>
            )}
          </label>
          <input
            type="text"
            required={isAddressRequired}
            placeholder="Rua, número, complemento e bairro (ex: Rua Oscar Freire, 1020 - Apto 41)"
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            Observações Especiais
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Cuidado com a película dos vidros; atenção aos bancos traseiros com pelos de pet."
            value={data.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
};
