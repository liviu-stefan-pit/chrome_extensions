// Anime Detail Modal (AniList powered) with favorite toggle
import { anilistMediaDetails } from '../api/media-details.js';
import { addFavorite, removeFavorite, isFavorite } from '../utils/favorites.js';

let detailRoot;
let currentMedia = null;

export function initAnimeDetail(){
  // Use existing modal from HTML instead of creating new one
  const overlay = document.getElementById('anime-detail-overlay');
  if (!overlay) return;
  
  overlay.addEventListener('click', e=>{ if(e.target===overlay) closeDetail(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeDetail(); });
  
  // Close button handler
  const closeBtn = overlay.querySelector('.ad-close');
  closeBtn?.addEventListener('click', closeDetail);
}

export function showAnimeDetail(id){
  const overlay = document.getElementById('anime-detail-overlay');
  const content = document.getElementById('anime-detail-content');
  if (!overlay || !content) return;
  
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden','false');
  content.innerHTML = skeleton();
  
  anilistMediaDetails(id).then(async data=>{
    currentMedia = data;
    const favorited = await isFavorite(id);
    content.innerHTML = render(data, favorited);
    attachFavoriteToggle(id);
  }).catch(err=>{
    console.error('[OtakuTab] detail error', err);
    content.innerHTML = `<div class='otk-error p-4'>Failed to load details.</div>`;
  });
}

export function closeDetail(){
  const overlay = document.getElementById('anime-detail-overlay');
  if(!overlay) return;
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden','true');
  currentMedia = null;
}

function attachFavoriteToggle(id) {
  const favBtn = document.getElementById('fav-toggle-btn');
  if (!favBtn) return;
  
  favBtn.addEventListener('click', async () => {
    const wasFavorited = favBtn.classList.contains('is-favorited');
    
    if (wasFavorited) {
      await removeFavorite(id);
      favBtn.classList.remove('is-favorited');
      favBtn.title = 'Add to favorites';
    } else {
      // Convert AniList media to storage format
      if (currentMedia) {
        await addFavorite({
          mal_id: currentMedia.id,
          id: currentMedia.id,
          title: currentMedia.title.english || currentMedia.title.romaji || 'Untitled',
          image: currentMedia.coverImage?.large || currentMedia.coverImage?.medium || '',
          images: {
            jpg: {
              image_url: currentMedia.coverImage?.large || currentMedia.coverImage?.medium || ''
            }
          },
          score: currentMedia.meanScore ? (currentMedia.meanScore / 10) : null,
          episodes: currentMedia.episodes,
          url: currentMedia.siteUrl,
          airingAt: currentMedia.nextAiringEpisode?.airingAt || null,
          broadcast: {}
        });
      }
      favBtn.classList.add('is-favorited');
      favBtn.title = 'Remove from favorites';
    }
  });
}

function skeleton(){
  return `<div class='p-6'>${Array.from({length:3}).map(()=>`<div class='skeleton h-[140px] mb-3'></div>`).join('')}</div>`;
}

function render(media, isFavorited = false){
  if(!media) return '<div class="p-4">No data.</div>';
  const title = escape(media.title.english || media.title.romaji || media.title.native || 'Untitled');
  const cover = media.coverImage?.extraLarge || media.coverImage?.large || '';
  const banner = media.bannerImage || '';
  const score = media.meanScore ? (media.meanScore/10).toFixed(1) : null;
  const season = [media.season, media.seasonYear].filter(Boolean).join(' ');
  const episodes = media.episodes ? `${media.episodes} eps` : (media.status==='RELEASING' && media.nextAiringEpisode? `${media.nextAiringEpisode.episode-1}+ eps` : '');
  const format = media.format || '';
  const duration = media.duration ? `${media.duration}m` : '';
  const studios = media.studios?.nodes?.filter(s=>s.isAnimationStudio).map(s=>s.name).slice(0,3).join(', ') || '';
  const genres = (media.genres||[]).slice(0,6).join(' · ');
  const tags = (media.tags||[]).filter(t=>t.rank>=70 && !t.isMediaSpoiler).slice(0,6).map(t=>t.name).join(' · ');
  const desc = sanitizeDescription(media.description || '');
  const site = media.siteUrl;
  const airing = media.nextAiringEpisode ? `Ep ${media.nextAiringEpisode.episode} airs ${relativeTime(media.nextAiringEpisode.airingAt*1000)}` : '';

  const badges = [format, season, episodes, duration].filter(Boolean).map(b=>`<span class='ad-badge'>${escape(b)}</span>`).join('');
  
  const favClass = isFavorited ? 'is-favorited' : '';
  const favTitle = isFavorited ? 'Remove from favorites' : 'Add to favorites';

  return `
    <div class="ad-header">
      ${banner ? `
        <div class="ad-banner">
          <img src="${banner}" alt="Banner">
          <div class="ad-banner-gradient" aria-hidden="true"></div>
        </div>` : ''}
      <div class="ad-hero">
        <div class="ad-cover">
          <img src="${cover}" alt="${title} cover">
          <button id="fav-toggle-btn" class="ad-fav-btn ${favClass}" title="${favTitle}" aria-pressed="${isFavorited}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="${isFavorited?'currentColor':'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        <div class="ad-hero-meta">
          <h2 id="ad-title" class="ad-title">${title}</h2>
          <div class="ad-badges">${badges}</div>
          <div class="ad-sub">${studios?escape(studios)+' · ':''}${genres}</div>
          ${tags?`<div class="ad-tags">${tags}</div>`:''}
          <div class="ad-stats">
            ${score?`<div class="ad-score" aria-label="Score">★ ${score}</div>`:''}
            ${airing?`<div class="ad-airing">${airing}</div>`:''}
          </div>
          <div class="ad-actions">
            <a href='${site}' target='_blank' rel='noopener' class='otk-btn-subtle'>Open on AniList</a>
          </div>
        </div>
      </div>
    </div>
    <div class="ad-body">
      <h3 class="ad-section-title">Synopsis</h3>
      <article class="ad-desc">${desc}</article>
    </div>`;
}

function escape(str=''){ return str.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }
function sanitizeDescription(html){
  return escape(html.replace(/<br\s*\/?>/gi,'\n').replace(/<i>|<\/i>|<b>|<\/b>/gi,'')).split('\n').slice(0,6).join('<br>');
}
function relativeTime(ts){
  const diff = ts - Date.now();
  if(diff <= 0) return 'soon';
  const mins = Math.floor(diff/60000);
  if(mins<60) return `in ${mins}m`;
  const hrs = Math.floor(mins/60);
  if(hrs<24) return `in ${hrs}h ${mins%60}m`;
  const days = Math.floor(hrs/24);
  return `in ${days}d ${hrs%24}h`;
}
