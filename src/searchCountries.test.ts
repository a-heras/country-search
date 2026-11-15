import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCountries } from './searchCountries.js';
import { HttpError } from './httpError.js';
import type { RawCountry } from './types.js';

const rawSpain: RawCountry = {
  area: 505992,
  flag: '🇪🇸',
  name: 'Spain',
  flags: { png: 'https://flagcdn.com/w320/es.png', svg: 'https://flagcdn.com/es.svg' },
  region: 'Europe',
  borders: ['AND', 'FRA'],
  capital: 'Madrid',
  demonym: 'Spanish',
  languages: [{ name: 'Spanish', iso639_1: 'es', iso639_2: 'spa', nativeName: 'Español' }],
  subregion: 'Southern Europe',
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
  nativeName: 'España',
  population: 47351567,
  timezones: ['UTC', 'UTC+01:00'],
};

function makeFetchMock(payload: unknown, init: { status?: number } = {}): typeof fetch {
  const status = init.status ?? 200;
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(payload),
  }) as unknown as typeof fetch;
}

describe('searchCountries — базовая логика', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('делает GET на правильный URL с query в пути', async () => {
    const fetchMock = makeFetchMock([rawSpain]);
    globalThis.fetch = fetchMock;

    const controller = new AbortController();
    await searchCountries('Spain', controller.signal);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('https://countries.dev/name/Spain');
    expect(init.method).toBe('GET');
    expect(init.signal).toBeDefined();
  });

  it('возвращает массив Country, замапленный через mapCountryResponse', async () => {
    globalThis.fetch = makeFetchMock([rawSpain]);

    const controller = new AbortController();
    const result = await searchCountries('Spain', controller.signal);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Spain');
    expect(result[0].currencies).toEqual(['Euro (€)']);
  });

  it('при 404 возвращает пустой массив (совпадений нет — не ошибка)', async () => {
    globalThis.fetch = makeFetchMock({ message: 'Not Found' }, { status: 404 });

    const controller = new AbortController();
    const result = await searchCountries('nonexistent', controller.signal);

    expect(result).toEqual([]);
  });

  it('при 500 бросает HttpError со status = 500', async () => {
    globalThis.fetch = makeFetchMock({ message: 'Server Error' }, { status: 500 });

    const controller = new AbortController();
    await expect(searchCountries('Spain', controller.signal)).rejects.toBeInstanceOf(HttpError);
  });

  it('HttpError хранит status в поле', async () => {
    globalThis.fetch = makeFetchMock({}, { status: 503 });

    const controller = new AbortController();
    try {
      await searchCountries('Spain', controller.signal);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      expect((err as HttpError).status).toBe(503);
    }
  });

  it('пробрасывает AbortError как есть (не превращает в HttpError)', async () => {
    const controller = new AbortController();
    const abortError = new DOMException('Aborted', 'AbortError');

    globalThis.fetch = vi.fn().mockImplementation(() => {
      return Promise.reject(abortError);
    }) as unknown as typeof fetch;

    await expect(searchCountries('Spain', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});

describe('searchCountries — таймаут и отмена', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('по истечении таймаута fetch отклоняется с TimeoutError, не AbortError', async () => {
    globalThis.fetch = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          reject(init.signal?.reason);
        });
      });
    }) as unknown as typeof fetch;

    const controller = new AbortController();
    await expect(searchCountries('Spain', controller.signal, 50)).rejects.toMatchObject({
      name: 'TimeoutError',
    });
  });

  it('при отмене пользователем fetch отклоняется с AbortError, не TimeoutError', async () => {
    globalThis.fetch = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          reject(init.signal?.reason);
        });
      });
    }) as unknown as typeof fetch;

    const controller = new AbortController();
    const promise = searchCountries('Spain', controller.signal, 10_000);
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('таймаут не срабатывает, если ответ пришёл раньше', async () => {
    globalThis.fetch = makeFetchMock([rawSpain]);

    const controller = new AbortController();
    const result = await searchCountries('Spain', controller.signal, 1000);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Spain');
  });
});
