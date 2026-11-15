import { describe, it, expect } from 'vitest';
import { mapCountryResponse } from './mapCountryResponse.js';
import type { RawCountry } from './types.js';

const rawSpain: RawCountry = {
  area: 505992,
  flag: '🇪🇸',
  name: 'Spain',
  flags: { png: 'https://flagcdn.com/w320/es.png', svg: 'https://flagcdn.com/es.svg' },
  region: 'Europe',
  borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
  capital: 'Madrid',
  demonym: 'Spanish',
  languages: [{ name: 'Spanish', iso639_1: 'es', iso639_2: 'spa', nativeName: 'Español' }],
  subregion: 'Southern Europe',
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
  nativeName: 'España',
  population: 47351567,
  timezones: ['UTC', 'UTC+01:00'],
};

describe('mapCountryResponse', () => {
  it('маппит базовые поля карточки', () => {
    const result = mapCountryResponse(rawSpain);

    expect(result.name).toBe('Spain');
    expect(result.flag).toBe('🇪🇸');
    expect(result.flagUrl).toBe('https://flagcdn.com/es.svg');
    expect(result.capital).toBe('Madrid');
    expect(result.region).toBe('Europe');
    expect(result.population).toBe(47351567);
  });

  it('преобразует languages в массив строк-имён', () => {
    const result = mapCountryResponse(rawSpain);
    expect(result.languages).toEqual(['Spanish']);
  });

  it('преобразует currencies в массив строк "Name (symbol)"', () => {
    const result = mapCountryResponse(rawSpain);
    expect(result.currencies).toEqual(['Euro (€)']);
  });

  it('маппит поля детального вида', () => {
    const result = mapCountryResponse(rawSpain);
    expect(result.area).toBe(505992);
    expect(result.borders).toEqual(['AND', 'FRA', 'GIB', 'PRT', 'MAR']);
    expect(result.nativeName).toBe('España');
    expect(result.demonym).toBe('Spanish');
    expect(result.timezones).toEqual(['UTC', 'UTC+01:00']);
  });

  it('устойчиво обрабатывает отсутствующие опциональные поля', () => {
    const raw: RawCountry = {
      name: 'Antarctica',
      flag: '🇦🇶',
      flags: { png: 'x.png', svg: 'x.svg' },
      capital: '',
      region: 'Antarctic',
      population: 1000,
      languages: [],
      area: 14000000,
      currencies: [],
      nativeName: 'Antarctica',
    };
    const result = mapCountryResponse(raw);

    expect(result.subregion).toBe('');
    expect(result.borders).toEqual([]);
    expect(result.demonym).toBe('');
    expect(result.timezones).toEqual([]);
    expect(result.languages).toEqual([]);
    expect(result.currencies).toEqual([]);
  });

  it('не мутирует входной объект (чистая функция)', () => {
    const snapshot = JSON.stringify(rawSpain);
    mapCountryResponse(rawSpain);
    expect(JSON.stringify(rawSpain)).toBe(snapshot);
  });

  it('валюта без символа — только name', () => {
    const raw: RawCountry = {
      ...rawSpain,
      currencies: [{ code: 'XXX', name: 'Test' }],
    };
    expect(mapCountryResponse(raw).currencies).toEqual(['Test']);
  });
});
