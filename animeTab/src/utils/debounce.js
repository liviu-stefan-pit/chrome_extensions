export function debounce(fn, delay = 300) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), delay); };
}
