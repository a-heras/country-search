import { el } from './dom.js';

export function renderLoading(): HTMLElement {
  return el('div', { className: 'state loading', textContent: 'Загрузка…' });
}

export function renderEmpty(): HTMLElement {
  return el('div', {
    className: 'state empty',
    textContent: 'Ничего не найдено. Попробуйте другой запрос.',
  });
}

export function renderError(onRetry: () => void): HTMLElement {
  const text = el('span', { textContent: 'Не удалось загрузить данные. Проверьте соединение.' });
  const btn = el('button', { type: 'button', textContent: 'Повторить' });
  btn.addEventListener('click', onRetry);

  return el('div', { className: 'state error' }, [text, btn]);
}
