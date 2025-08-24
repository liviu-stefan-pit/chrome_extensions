import { searchAnime } from '../api/jikan.js';
import { debounce } from '../utils/debounce.js';

export function initSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const errorEl = document.getElementById('search-error');

  function reset() {
    results.innerHTML = '';
    results.classList.add('hidden');
    errorEl.classList.add('hidden');
  }

  async function handleSearch(query) {
    if (query.length < 3) {
      reset();
      return;
    }
    try {
      const rawData = await searchAnime(query);
      const data = Array.isArray(rawData) ? rawData : [];
      if (!data.length) {
  results.innerHTML = '<li class="px-3 py-2 text-[11px] opacity-70">No results</li>';
        results.classList.remove('hidden');
        return;
      }
      results.innerHTML = data.map(item => {
        const img = item?.images?.jpg?.image_url || item?.images?.webp?.image_url || '';
        const title = escapeHtml(item?.title || 'Untitled');
  return `<li><a href="${item?.url}" target="_blank" rel="noopener noreferrer"><img src="${img}" alt="${title}"><span class="text-xs md:text-sm leading-tight">${title}</span></a></li>`;
      }).join('');
      results.classList.remove('hidden');
    } catch (e) {
      errorEl.textContent = 'Search failed. Try again.';
      errorEl.classList.remove('hidden');
      console.error('[OtakuTab] search error', e);
    }
  }

  input.addEventListener('input', debounce(ev => handleSearch(ev.target.value.trim()), 300));
  document.addEventListener('click', e => {
    if (!results.contains(e.target) && e.target !== input) {
      reset();
    }
  });
}

function escapeHtml(str='') { return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
