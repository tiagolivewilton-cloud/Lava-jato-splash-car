// Utilitários de localização gratuitos e sem chave de API:
// - Nominatim (OpenStreetMap) para transformar endereço em coordenadas
// - OSRM (servidor público) para a distância pela rua, com reserva em linha reta
// A localização do cliente é usada só no aparelho dele para calcular a distância:
// não é salva, não vai para o banco e não aparece para o lava-rápido.

export interface LatLng {
  lat: number;
  lng: number;
}

// Distância em linha reta (km)
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Distância pela rua (km). Se o serviço de rotas falhar, usa a linha reta + 30%.
export async function routeDistanceKm(
  from: LatLng,
  to: LatLng
): Promise<{ km: number; byRoad: boolean }> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    const data = await res.json();
    const meters = data?.routes?.[0]?.distance;
    if (typeof meters === 'number' && meters > 0) {
      return { km: meters / 1000, byRoad: true };
    }
  } catch {}
  return { km: haversineKm(from, to) * 1.3, byRoad: false };
}

// Endereço → coordenadas (Brasil)
export async function geocodeAddress(address: string): Promise<(LatLng & { label: string }) | null> {
  const q = address.trim();
  if (!q) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&accept-language=pt-BR&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      return { lat: Number(data[0].lat), lng: Number(data[0].lon), label: String(data[0].display_name || q) };
    }
  } catch {}
  return null;
}

// Localização atual do aparelho (pede permissão ao usuário)
export function getDevicePosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Este aparelho não permite localização.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) =>
        reject(
          new Error(
            err.code === err.PERMISSION_DENIED
              ? 'Permissão de localização negada. Digite o endereço.'
              : 'Não foi possível obter a localização. Digite o endereço.'
          )
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

export const formatKm = (km: number) => km.toFixed(1).replace('.', ',');
