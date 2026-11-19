// All 27 EU member states with approximate map centres (used for the Leaflet map).
export interface EuCountry {
  code: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
}

export const EU_COUNTRIES: EuCountry[] = [
  { code: 'AT', name: 'Austria', flag: '🇦🇹', lat: 47.52, lng: 14.55 },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', lat: 50.5, lng: 4.47 },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', lat: 42.73, lng: 25.49 },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', lat: 45.1, lng: 15.2 },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', lat: 35.13, lng: 33.43 },
  { code: 'CZ', name: 'Czechia', flag: '🇨🇿', lat: 49.82, lng: 15.47 },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', lat: 56.13, lng: 9.5 },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', lat: 58.6, lng: 25.01 },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', lat: 61.92, lng: 25.75 },
  { code: 'FR', name: 'France', flag: '🇫🇷', lat: 46.6, lng: 2.35 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', lat: 51.16, lng: 10.45 },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', lat: 39.07, lng: 21.82 },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', lat: 47.16, lng: 19.5 },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', lat: 53.14, lng: -7.69 },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', lat: 42.8, lng: 12.5 },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', lat: 56.88, lng: 24.6 },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', lat: 55.17, lng: 23.88 },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', lat: 49.82, lng: 6.13 },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', lat: 35.94, lng: 14.38 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', lat: 52.13, lng: 5.29 },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', lat: 51.92, lng: 19.15 },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', lat: 39.4, lng: -8.22 },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', lat: 45.94, lng: 24.97 },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', lat: 48.67, lng: 19.7 },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', lat: 46.15, lng: 14.99 },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', lat: 40.2, lng: -3.7 },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', lat: 60.13, lng: 18.64 },
];

export type Category = 'jobs' | 'seekers' | 'housing' | 'services';

export const TARGET_COUNTRIES: EuCountry[] = EU_COUNTRIES.filter((c) => c.code === 'ES' || c.code === 'FR');

export const CITY_OPTIONS: Record<string, string[]> = {
  ES: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Alicante', 'Bilbao', 'Palma'],
  FR: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille'],
};

export const CATEGORIES: Category[] = ['jobs', 'seekers', 'housing', 'services'];

export type Section = 'home' | 'category' | 'legal';

export function categoryLabel(cat: Category, t: { catJobs: string; catSeekers: string; catHousing: string; catServices: string }): string {
  return { jobs: t.catJobs, seekers: t.catSeekers, housing: t.catHousing, services: t.catServices }[cat];
}

export interface Listing {
  id: string;
  category: Category;
  title: string;
  description: string;
  country_code: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  price_text: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  details: Record<string, unknown>;
  user_id: string;
  status: string;
  featured: boolean;
  verified: boolean;
  report_count: number;
  created_at: string;
  expires_at: string;
}

export interface LiveJob {
  id: string;
  title: string;
  company: string;
  country: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  salaryText: string;
  jobType: string;
  languages: string;
  applyUrl: string;
  description: string;
  postedAt: number | null;
}

export interface ReportReason {
  value: string;
}
