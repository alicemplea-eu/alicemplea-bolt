import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EU_COUNTRIES } from '@/lib/eu';
import type { Listing } from '@/lib/eu';
import { countryInfo } from '@/components/ListingCard';
import { useLang } from '@/lib/LanguageContext';

interface Props {
  listings: Listing[];
  userPos: [number, number] | null;
}

export default function ListingMap({ listings, userPos }: Props) {
  const { t } = useLang();
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);
    map.setView([48.5, 10], 4);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const points = listings.filter((l) => l.latitude != null && l.longitude != null);
    for (const l of points) {
      const country = countryInfo(l.country_code);
      L.circleMarker([l.latitude as number, l.longitude as number], {
        radius: l.featured ? 10 : 7,
        color: l.featured ? '#fbbf24' : '#0d9488',
        fillColor: l.featured ? '#fcd34d' : '#14b8a6',
        fillOpacity: 0.9,
        weight: 2,
      })
        .bindPopup(
          `<strong>${escapeHtml(l.title)}</strong><br/>${country?.flag ?? ''} ${escapeHtml(l.city)}<br/><em>${escapeHtml(
            l.price_text || ''
          )}</em>`
        )
        .addTo(layer);
    }

    const coords: [number, number][] = points.map((l) => [l.latitude as number, l.longitude as number]);
    if (userPos) {
      L.circleMarker(userPos, { radius: 8, color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 })
        .bindPopup(t.nearMe)
        .addTo(layer);
      coords.push(userPos);
    }
    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords).pad(0.25), { maxZoom: 11 });
    } else {
      map.setView([48.5, 10], 4);
    }
  }, [listings, userPos, t]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/30 shadow-xl">
      <div ref={containerRef} className="h-[60vh] min-h-[400px] w-full bg-slate-300" aria-label={t.mapTitle} />
      <p className="bg-slate-900/80 px-3 py-1.5 text-[11px] text-white/80">
        &copy; <a href="https://www.openstreetmap.org/copyright" className="underline">OpenStreetMap</a> contributors · {EU_COUNTRIES.length} {t.countriesEu}
      </p>
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
