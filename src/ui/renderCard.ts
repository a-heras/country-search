import type { Country } from '../types.js';
import { el } from './dom.js';

export function renderCard(country: Country, onClick: (c: Country) => void): HTMLButtonElement {
  const flag = el('div', { className: 'card-flag', textContent: country.flag });
  const name = el('div', { className: 'card-name', textContent: country.name });
  const capital = el('div', {
    className: 'card-meta',
    textContent: `Столица: ${country.capital || '—'}`,
  });
  const region = el('div', {
    className: 'card-meta',
    textContent: `Регион: ${country.region || '—'}`,
  });
  const population = el('div', {
    className: 'card-meta',
    textContent: `Население: ${country.population.toLocaleString('ru-RU')}`,
  });

  const card = el('button', { className: 'card', type: 'button' }, [
    flag,
    name,
    capital,
    region,
    population,
  ]);

  card.addEventListener('click', () => onClick(country));

  return card;
}
