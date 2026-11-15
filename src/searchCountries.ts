import type { Country, RawCountry } from './types.js';
import { mapCountryResponse } from './mapCountryResponse.js';
import { HttpError } from './httpError.js';

const BASE_URL = 'https://countries.dev';
const DEFAULT_TIMEOUT_MS = 10_000;

export async function searchCountries(
  query: string,
  signal: AbortSignal,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Country[]> {
  const url = `${BASE_URL}/name/${encodeURIComponent(query)}`;
  const combined = AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]);

  const response = await fetch(url, { method: 'GET', signal: combined });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  const data = (await response.json()) as RawCountry[];
  return data.map(mapCountryResponse);
}
