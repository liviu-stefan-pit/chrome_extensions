// Anime Detail Modal (AniList powered)
import { anilistMediaDetails } from '../api/media-details.js';

let detailRoot;

export function initAnimeDetail(){
  if(detailRoot) return;
  detailRoot = document.createElement('div');
  detailRoot.id = 'anime-detail-root';
  detailRoot.innerHTML = `
    <div class="ad-overlay hidden" id="ad-overlay" aria-hidden="true">
      <div class="ad-modal" role="dialog" aria-modal="true" aria-labelledby="ad-title">
        <button class="ad-close" id="ad-close" aria-label="Close details">×</button>
        <div class="ad-content" id="ad-content"></div>
      </div>
    </div>`;
  document.body.appendChild(detailRoot);
  const overlay = document.getElementById('ad-overlay');
  const closeBtn = document.getElementById('ad-close');
  closeBtn.addEventListener('click', closeDetail);
  overlay.addEventListener('click', e=>{ if(e.target===overlay) closeDetail(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeDetail(); });
}

export function showAnimeDetail(id){
  initAnimeDetail();
  const overlay = document.getElementById('ad-overlay');
  const content = document.getElementById('ad-content');
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden','false');
  content.innerHTML = skeleton();
  anilistMediaDetails(id).then(data=>{
    content.innerHTML = render(data);
  }).catch(err=>{
    console.error('[OtakuTab] detail error', err);
    content.innerHTML = `<div class='otk-error p-4'>Failed to load details.</div>`;
  });
}

export function closeDetail(){
  const overlay = document.getElementById('ad-overlay');
  if(!overlay) return;
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden','true');
}

function skeleton(){
  return `<div class='ad-grid'>${Array.from({length:3}).map(()=>`<div class='skeleton h-[140px]'></div>`).join('')}</div>`;
}

function render(media){
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

  return `
    <div class='ad-header'>
      ${banner?`<div class='ad-banner'><img src='${banner}' alt='Banner'></div>`:''}
      <div class='ad-hero'>
        <div class='ad-cover'><img src='${cover}' alt='${title} cover'></div>
        <div class='ad-hero-meta'>
          <h2 id='ad-title' class='ad-title'>${title}</h2>
          <div class='ad-badges'>${badges}</div>
          <div class='ad-sub'>${studios?escape(studios)+' · ':''}${genres}</div>
          <div class='ad-tags'>${tags}</div>
          <div class='ad-airing'>${airing}</div>
          <div class='ad-score'>${score?`★ ${score}`:''}</div>
          <div class='ad-actions'>
            <a href='${site}' target='_blank' rel='noopener' class='otk-btn-subtle'>Open on AniList</a>
          </div>
        </div>
      </div>
    </div>
    <div class='ad-body'>
      <article class='ad-desc'>${desc}</article>
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
