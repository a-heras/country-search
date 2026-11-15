import type { Country, RawCountry } from './types.js';

function formatCurrency(name: string, symbol?: string): string {
  return symbol ? `${name} (${symbol})` : name;
}

export function mapCountryResponse(raw: RawCountry): Country {
  return {
    name: raw.name,
    flag: raw.flag,
    flagUrl: raw.flags.svg,
    capital: raw.capital,
    region: raw.region,
    subregion: raw.subregion ?? '',
    population: raw.population,
    languages: raw.languages.map((l) => l.name),
    area: raw.area,
    borders: raw.borders ?? [],
    currencies: raw.currencies.map((c) => formatCurrency(c.name, c.symbol)),
    nativeName: raw.nativeName,
    demonym: raw.demonym ?? '',
    timezones: raw.timezones ?? [],
  };
}
