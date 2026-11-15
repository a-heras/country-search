import type { Country } from '../types.js';
import { el } from './dom.js';

export function renderDetail(country: Country, onClose: () => void): HTMLElement {
  const title = el('h2', { textContent: `${country.flag} ${country.name}` });

  const dl = el('dl', {}, [
    el('dt', { textContent: 'Официальное название' }),
    el('dd', { textContent: country.nativeName || '—' }),
    el('dt', { textContent: 'Столица' }),
    el('dd', { textContent: country.capital || '—' }),
    el('dt', { textContent: 'Регион' }),
    el('dd', {
      textContent: `${country.region}${country.subregion ? `, ${country.subregion}` : ''}`,
    }),
    el('dt', { textContent: 'Население' }),
    el('dd', { textContent: country.population.toLocaleString('ru-RU') }),
    el('dt', { textContent: 'Площадь' }),
    el('dd', { textContent: `${country.area.toLocaleString('ru-RU')} км²` }),
    el('dt', { textContent: 'Языки' }),
    el('dd', { textContent: country.languages.join(', ') || '—' }),
    el('dt', { textContent: 'Валюты' }),
    el('dd', { textContent: country.currencies.join(', ') || '—' }),
    el('dt', { textContent: 'Границы' }),
    el('dd', { textContent: country.borders.join(', ') || '—' }),
    el('dt', { textContent: 'Демоним' }),
    el('dd', { textContent: country.demonym || '—' }),
    el('dt', { textContent: 'Часовые пояса' }),
    el('dd', { textContent: country.timezones.join(', ') || '—' }),
  ]);

  const close = el('button', { className: 'close', type: 'button', textContent: 'Закрыть' });
  close.addEventListener('click', onClose);

  return el('div', { className: 'detail' }, [title, dl, close]);
}
