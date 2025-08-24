import { fetchRandomAnime } from '../api/jikan.js';
import { showAnimeDetail } from './animeDetail.js';
import { malToAniListId } from '../api/media-details.js';

export function initDiscover() {
  const btn = document.getElementById('discover-btn');
  const modal = document.getElementById('discover-modal'); // legacy modal (will be hidden)
  const closeBtn = document.getElementById('modal-close');
  const loadingEl = document.getElementById('discover-loading');
  const resultEl = document.getElementById('discover-result');
  const errorEl = document.getElementById('discover-error');

  function closeModal() { if(modal) modal.classList.add('hidden'); }

  async function loadRandom() {
    errorEl.classList.add('hidden');
    try {
      const data = await fetchRandomAnime();
      const anime = Array.isArray(data) ? data[0] : data;
      
      if(anime?.mal_id){
        console.log('[OtakuTab] Got random anime:', anime.title, 'MAL ID:', anime.mal_id);
        try {
          const aniListId = await malToAniListId(anime.mal_id);
          if(aniListId) {
            console.log('[OtakuTab] Mapped to AniList ID:', aniListId);
            showAnimeDetail(aniListId);
          } else {
            throw new Error('No AniList mapping found');
          }
        } catch(mappingError) {
          console.warn('[OtakuTab] MAL->AniList mapping failed:', mappingError);
          errorEl.textContent = `Found anime "${anime.title}" but couldn't load full details. Try again.`;
          errorEl.classList.remove('hidden');
        }
      } else {
        throw new Error('No MAL ID in random anime response');
      }
    } catch (e) {
      console.error('[OtakuTab] random anime error', e);
      errorEl.textContent = 'Failed to fetch random anime. Please try again.';
      errorEl.classList.remove('hidden');
    }
  }

  btn.addEventListener('click', () => { loadRandom(); });
  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  if(modal) {
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function escapeHtml(str='') { return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
