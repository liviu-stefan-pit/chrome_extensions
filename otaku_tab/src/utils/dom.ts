import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: {
    className?: string;
    text?: string;
    html?: string;
    attrs?: Record<string, string>;
    children?: HTMLElement[];
  }
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  if (options?.className) {
    el.className = options.className;
  }

  if (options?.text) {
    el.textContent = options.text;
  }

  if (options?.html) {
    el.innerHTML = options.html;
  }

  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
  }

  if (options?.children) {
    options.children.forEach(child => el.appendChild(child));
  }

  return el;
}

export function qs<T extends Element = Element>(selector: string, parent: Element | Document = document): T | null {
  return parent.querySelector<T>(selector);
}

export function qsa<T extends Element = Element>(selector: string, parent: Element | Document = document): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}
