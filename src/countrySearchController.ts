import type { Country } from './types.js';
import { searchCountries } from './searchCountries.js';

export interface CountrySearchController {
  search(query: string): Promise<Country[] | null>;
  cancel(): void;
}

export function createCountrySearchController(): CountrySearchController {
  let current: AbortController | null = null;

  function cancel(): void {
    if (current !== null) {
      current.abort();
      current = null;
    }
  }

  async function search(query: string): Promise<Country[] | null> {
    cancel();

    const controller = new AbortController();
    current = controller;

    try {
      const result = await searchCountries(query, controller.signal);
      if (current !== controller) return null;
      return result;
    } catch (err) {
      if (isAbortError(err)) return null;
      throw err;
    } finally {
      if (current === controller) {
        current = null;
      }
    }
  }

  return { search, cancel };
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}
