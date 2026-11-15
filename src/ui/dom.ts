export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<{
    className: string;
    textContent: string;
    type: string;
    ariaLabel: string;
    dataset: Record<string, string>;
  }> = {},
  children: Node[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  if (props.className) node.className = props.className;
  if (props.textContent !== undefined) node.textContent = props.textContent;
  if (props.type) node.setAttribute('type', props.type);
  if (props.ariaLabel) node.setAttribute('aria-label', props.ariaLabel);
  if (props.dataset) {
    for (const [k, v] of Object.entries(props.dataset)) {
      node.dataset[k] = v;
    }
  }

  for (const child of children) node.appendChild(child);

  return node;
}

export function clear(node: HTMLElement): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}
