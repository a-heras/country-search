import type { Country } from './types.js';

export interface CountrySearchController {
  search(query: string): Promise<Country[]>;
  cancel(): void;
}

export function createCountrySearchController(): CountrySearchController {
  throw new Error('not implemented');
}
