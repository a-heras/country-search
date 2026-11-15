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
    // 1. Отменяем предыдущий активный запрос ДО создания нового,
    //    чтобы устаревший ответ не прилетел и не перезаписал актуальный.
    cancel();

    const controller = new AbortController();
    current = controller;

    try {
      const result = await searchCountries(query, controller.signal);

      // 2. Защита от «фальшивого» завершения: если к моменту ответа
      //    этот controller уже не текущий — значит, его отменили или
      //    перекрыли новым запросом. Возвращаем null.
      if (current !== controller) {
        return null;
      }

      return result;
    } catch (err) {
      // 3. Отмена — не ошибка. Возвращаем null.
      if (isAbortError(err)) {
        return null;
      }
      // 4. Настоящая ошибка — пробрасываем наверх (UI покажет «Повторить»).
      throw err;
    } finally {
      // 5. Если это всё ещё наш controller — сбрасываем ссылку,
      //    чтобы следующие вызовы не отменяли уже завершённый запрос.
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
