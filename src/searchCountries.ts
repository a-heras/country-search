import type { Country, RawCountry } from './types.js';
import { mapCountryResponse } from './mapCountryResponse.js';
import { HttpError } from './httpError.js';

const BASE_URL = 'https://countries.dev';

export async function searchCountries(query: string, signal: AbortSignal): Promise<Country[]> {
  const url = `${BASE_URL}/name/${encodeURIComponent(query)}`;

  const response = await fetch(url, { method: 'GET', signal });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  const data = (await response.json()) as RawCountry[];
  return data.map(mapCountryResponse);
}
