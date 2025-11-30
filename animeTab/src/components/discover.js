import { fetchRandomAnime } from '../api/jikan.js';
import { showAnimeDetail } from './animeDetail.js';
import { malToAniListId, anilistMediaDetails } from '../api/media-details.js';

export function initDiscover() {
  const btn = document.getElementById('discover-btn');
  const modal = document.getElementById('discover-modal'); // legacy modal (will be hidden)
  const closeBtn = document.getElementById('modal-close');
  const loadingEl = document.getElementById('discover-loading');
  const resultEl = document.getElementById('discover-result');
  const errorEl = document.getElementById('discover-error');

  function closeModal() { if(modal) modal.classList.add('hidden'); }

  async function loadRandom(attempt = 1, maxAttempts = 5) {
    errorEl.classList.add('hidden');
    
    // Show loading feedback if first attempt
    if(attempt === 1) {
      console.log('[OtakuTab] Searching for random anime...');
    } else {
      console.log(`[OtakuTab] Retry attempt ${attempt}/${maxAttempts}...`);
    }
    
    try {
      const data = await fetchRandomAnime();
      const anime = Array.isArray(data) ? data[0] : data;
      
      if(!anime?.mal_id) {
        throw new Error('No MAL ID in random anime response');
      }
      
      console.log(`[OtakuTab] Got random anime (attempt ${attempt}):`, anime.title, 'MAL ID:', anime.mal_id);
      
      try {
        // Try to map MAL ID to AniList ID
        const aniListId = await malToAniListId(anime.mal_id);
        if(!aniListId) {
          throw new Error('No AniList mapping found');
        }
        
        console.log('[OtakuTab] Mapped to AniList ID:', aniListId);
        
        // Try to get full details to verify they're complete
        const details = await anilistMediaDetails(aniListId);
        if(!details || !details.title || !details.coverImage) {
          throw new Error('Incomplete anime details');
        }
        
        console.log('[OtakuTab] Found complete anime details, showing modal');
        showAnimeDetail(aniListId);
        return; // Success!
        
      } catch(mappingError) {
        console.warn(`[OtakuTab] Attempt ${attempt} failed:`, mappingError.message);
        
        // If we haven't reached max attempts, try again
        if(attempt < maxAttempts) {
          return loadRandom(attempt + 1, maxAttempts);
        } else {
          throw new Error(`Couldn't find a suitable anime after ${maxAttempts} attempts`);
        }
      }
      
    } catch (e) {
      console.error('[OtakuTab] random anime error', e);
      errorEl.textContent = e.message.includes('attempts') 
        ? 'Unable to find a good random anime. Please try again.' 
        : 'Failed to fetch random anime. Please try again.';
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
