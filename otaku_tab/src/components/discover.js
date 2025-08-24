import { fetchRandomAnime } from '../api/jikan.js';

export function initDiscover() {
  const btn = document.getElementById('discover-btn');
  const modal = document.getElementById('discover-modal');
  const closeBtn = document.getElementById('modal-close');
  const loadingEl = document.getElementById('discover-loading');
  const resultEl = document.getElementById('discover-result');
  const errorEl = document.getElementById('discover-error');

  function openModal() { modal.classList.remove('hidden'); }
  function closeModal() { modal.classList.add('hidden'); }

  async function loadRandom() {
    loadingEl.classList.remove('hidden');
    resultEl.innerHTML = '';
    errorEl.classList.add('hidden');
    try {
      const data = await fetchRandomAnime();
      const anime = Array.isArray(data) ? data[0] : data; // API returns object in data
      renderAnime(anime);
    } catch (e) {
      resultEl.innerHTML = '';
      resultEl.insertAdjacentHTML('beforeend', `<div class="error">Failed to fetch. Please try again.</div>`);
      console.error('[OtakuTab] random anime error', e);
    } finally {
      loadingEl.classList.add('hidden');
    }
  }

  function renderAnime(anime) {
    if (!anime) return;
    const img = anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url || '';
    const title = escapeHtml(anime?.title || 'Untitled');
    const scoreRaw = anime?.score != null ? Number(anime.score).toFixed(1) : null;
    const score = scoreRaw ? `★ ${scoreRaw}` : 'No score';
    const genres = (anime?.genres || []).map(g => g.name).join(', ');
    const synopsis = escapeHtml((anime?.synopsis || '').split('\n').slice(0,6).join('\n'));
    const season = anime?.season ? `${anime.season} ${anime?.year || ''}`.trim() : (anime?.year || '');
    const type = anime?.type || '';
    const episodes = anime?.episodes != null ? `${anime.episodes} eps` : '';
  const badges = [type, season, episodes].filter(Boolean).map(b=>`<span class="otk-badge-outline">${escapeHtml(b)}</span>`).join(' ');

    resultEl.innerHTML = `<div class="otk-discover-result" role="group" aria-label="Random anime result">
      <div class="otk-discover-image"><img src="${img}" alt="${title} key visual"></div>
      <div class="otk-discover-meta">
        <h3>${title}</h3>
        <div class="score" aria-label="Score">${score}</div>
        <div class="genres">${escapeHtml(genres)}</div>
        <div class="flex flex-wrap gap-2 my-1">${badges}</div>
        <div class="synopsis">${synopsis}</div>
        <div class="mt-4 flex flex-wrap gap-3">
          <a href="${anime?.url}" target="_blank" rel="noopener noreferrer" class="otk-btn no-underline">View on MAL</a>
          <button class="otk-btn-subtle" id="discover-another" type="button">Another One</button>
        </div>
      </div>
    </div>`;
    const another = document.getElementById('discover-another');
    if(another){
      another.addEventListener('click', () => loadRandom());
    }
  }

  btn.addEventListener('click', () => { openModal(); loadRandom(); });
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function escapeHtml(str='') { return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
