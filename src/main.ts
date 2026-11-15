import { debounce } from './debounce.js';
import { createCountrySearchController } from './countrySearchController.js';
import type { Country } from './types.js';
import { el, clear } from './ui/dom.js';
import { renderCard } from './ui/renderCard.js';
import { renderDetail } from './ui/renderDetail.js';
import { renderLoading, renderEmpty, renderError } from './ui/renderStates.js';

const DEBOUNCE_MS = 300;

function mount(): void {
  const heading = el('h1', { textContent: 'Поиск стран' });
  const input = el('input', { type: 'search', ariaLabel: 'Поиск страны' });
  input.id = 'search-input';
  input.placeholder = 'Начните вводить название страны…';

  const results = el('div');

  document.body.appendChild(heading);
  document.body.appendChild(input);
  document.body.appendChild(results);

  const controller = createCountrySearchController();
  let lastQuery = '';

  function showDetail(country: Country): void {
    clear(results);
    results.appendChild(renderDetail(country, () => input.focus()));
  }

  function renderResults(list: Country[]): void {
    clear(results);
    if (list.length === 0) {
      results.appendChild(renderEmpty());
      return;
    }
    const ul = el('ul', { className: 'results' });
    for (const country of list) {
      const li = el('li');
      li.appendChild(renderCard(country, showDetail));
      ul.appendChild(li);
    }
    results.appendChild(ul);
  }

  async function runSearch(query: string): Promise<void> {
    lastQuery = query;

    if (query.trim() === '') {
      controller.cancel();
      clear(results);
      return;
    }

    clear(results);
    results.appendChild(renderLoading());

    try {
      const data = await controller.search(query);
      if (data === null) return;
      renderResults(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      clear(results);
      results.appendChild(renderError(() => void runSearch(lastQuery)));
    }
  }

  const debouncedSearch = debounce((query: string) => void runSearch(query), DEBOUNCE_MS);

  input.addEventListener('input', () => {
    const query = input.value;
    controller.cancel();
    debouncedSearch(query);
  });

  input.focus();
}

mount();
