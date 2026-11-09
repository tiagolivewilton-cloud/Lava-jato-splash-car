import { useEffect, useRef, useState } from 'react';
import type { LatLng } from '../lib/geo';

// Mapa OpenStreetMap com Leaflet carregado do CDN (gratuito, sem chave de API).
// Mostra só o ponto do lava-rápido. Com `onPick`, o dono pode arrastar o pino ou tocar no mapa.

const LEAFLET_VERSION = '1.9.4';
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletNS = any;

let leafletPromise: Promise<LeafletNS> | null = null;

function loadLeaflet(): Promise<LeafletNS> {
  const w = window as unknown as { L?: LeafletNS };
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve((window as unknown as { L: LeafletNS }).L);
    script.onerror = () => {
      leafletPromise = null;
      reject(new Error('Não foi possível carregar o mapa.'));
    };
    document.head.appendChild(script);
  });
  return leafletPromise;
}

interface LocationMapProps {
  point: LatLng | null;
  label?: string;
  onPick?: (p: LatLng) => void;
  height?: number;
}

export function LocationMap({ point, label, onPick, height = 180 }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletNS>(null);
  const markerRef = useRef<LeafletNS>(null);
  const onPickRef = useRef(onPick);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  onPickRef.current = onPick;

  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const start = point || { lat: -15.78, lng: -47.93 };
        const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView(
          [start.lat, start.lng],
          point ? 15 : 4
        );
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap',
        }).addTo(map);
        if (onPickRef.current) {
          map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
            onPickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
          });
        }
        mapRef.current = map;
        setReady(true);
      })
      .catch((err: Error) => setError(err.message));
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atualiza o pino quando o ponto muda
  useEffect(() => {
    const L = (window as unknown as { L?: LeafletNS }).L;
    const map = mapRef.current;
    if (!ready || !L || !map) return;
    if (!point) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }
    const icon = L.divIcon({
      className: '',
      html: '<div style="font-size:26px;line-height:26px;transform:translate(-13px,-24px)">📍</div>',
      iconSize: [0, 0],
    });
    if (!markerRef.current) {
      markerRef.current = L.marker([point.lat, point.lng], { icon, draggable: !!onPickRef.current }).addTo(map);
      markerRef.current.on('dragend', () => {
        const ll = markerRef.current.getLatLng();
        onPickRef.current?.({ lat: ll.lat, lng: ll.lng });
      });
    } else {
      markerRef.current.setLatLng([point.lat, point.lng]);
    }
    if (label) markerRef.current.bindTooltip(label, { direction: 'top', offset: [0, -24] });
    map.setView([point.lat, point.lng], Math.max(map.getZoom(), 15));
  }, [point?.lat, point?.lng, label, ready]);

  if (error) {
    return (
      <div className="text-[10px] text-zinc-500 border border-dashed border-zinc-800 rounded-xl p-3 text-center">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 relative z-0"
    />
  );
}
