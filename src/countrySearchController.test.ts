import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCountrySearchController } from './countrySearchController.js';
import type { RawCountry } from './types.js';

const rawSpain: RawCountry = {
  area: 505992,
  flag: '🇪🇸',
  name: 'Spain',
  flags: { png: 'x.png', svg: 'x.svg' },
  region: 'Europe',
  capital: 'Madrid',
  languages: [{ name: 'Spanish' }],
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
  nativeName: 'España',
  population: 47351567,
};

const rawSp: RawCountry = { ...rawSpain, name: 'Spain (sp)' };

interface PendingRequest {
  url: string;
  signal: AbortSignal;
  resolve: (payload: RawCountry[]) => void;
  reject: (reason: unknown) => void;
}

function createHangingFetchMock(): {
  fetchMock: typeof fetch;
  pending: PendingRequest[];
} {
  const pending: PendingRequest[] = [];
  const fetchMock = vi.fn().mockImplementation((url: string, init: RequestInit) => {
    return new Promise<{ ok: boolean; status: number; json: () => Promise<RawCountry[]> }>(
      (resolve, reject) => {
        const signal = init.signal as AbortSignal;
        const entry: PendingRequest = {
          url: String(url),
          signal,
          resolve: (payload) =>
            resolve({ ok: true, status: 200, json: () => Promise.resolve(payload) }),
          reject,
        };
        pending.push(entry);

        signal.addEventListener('abort', () => {
          // имитируем поведение настоящего fetch: при abort отклоняем с reason
          reject(signal.reason);
        });
      },
    );
  }) as unknown as typeof fetch;

  return { fetchMock, pending };
}

describe('countrySearchController — гонка запросов', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('отменяет предыдущий запрос при новом вводе (AbortController, а не флаг)', async () => {
    const { fetchMock, pending } = createHangingFetchMock();
    globalThis.fetch = fetchMock;

    const controller = createCountrySearchController();

    const first = controller.search('sp');
    const second = controller.search('spain');

    expect(pending).toHaveLength(2);
    // первый сигнал должен быть отменён
    expect(pending[0].signal.aborted).toBe(true);
    expect(pending[1].signal.aborted).toBe(false);

    // резолвим оба в обратном порядке (гонка!)
    pending[1].resolve([rawSpain]);
    pending[0].resolve([rawSp]);

    const [firstResult, secondResult] = await Promise.all([first, second]);

    // старый запрос не должен «победить» — его результат null
    expect(firstResult).toBeNull();
    expect(secondResult).not.toBeNull();
    expect(secondResult![0].name).toBe('Spain');
  });

  it('если устаревший ответ приходит первым, а свежий — вторым, побеждает свежий', async () => {
    const { fetchMock, pending } = createHangingFetchMock();
    globalThis.fetch = fetchMock;

    const controller = createCountrySearchController();

    const first = controller.search('sp');
    const second = controller.search('spain');

    // обратный порядок: старый резолвится ПОСЛЕ нового
    pending[1].resolve([rawSpain]);
    pending[0].resolve([rawSp]);

    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult).toBeNull();
    expect(secondResult![0].name).toBe('Spain');
  });

  it('если мок fetch не среагировал на abort, старый результат всё равно отбрасывается', async () => {
    // этот тест проверяет, что даже если fetch вернул данные по отменённому сигналу,
    // контроллер не отдаёт их как актуальные
    const { fetchMock, pending } = createHangingFetchMock();
    globalThis.fetch = fetchMock;

    const controller = createCountrySearchController();

    const first = controller.search('sp');
    const second = controller.search('spain');

    // резолвим «отменённый» промис — контроллер должен это распознать
    pending[0].resolve([rawSp]);
    pending[1].resolve([rawSpain]);

    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult).toBeNull();
    expect(secondResult![0].name).toBe('Spain');
  });

  it('cancel() отменяет текущий активный запрос', async () => {
    const { fetchMock, pending } = createHangingFetchMock();
    globalThis.fetch = fetchMock;

    const controller = createCountrySearchController();
    const promise = controller.search('spain');

    controller.cancel();
    expect(pending[0].signal.aborted).toBe(true);

    await expect(promise).resolves.toBeNull();
  });
});
