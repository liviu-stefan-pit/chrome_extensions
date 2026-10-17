import { fetchTrendingNow, fetchPopularSeason } from '../api/anilist-only.js';
import { showAnimeDetail } from './animeDetail.js';

const trendingContainer = () => document.getElementById('row-trending');
const popularContainer = () => document.getElementById('row-popular');

function enableWheelHorizontal(rowId){
  const row = document.getElementById(rowId);
  if(!row) return;
  // Make focusable for keyboard nav
  row.setAttribute('tabindex','0');
  // Keyboard arrows
  row.addEventListener('keydown', e => {
    if(e.key === 'ArrowRight'){ e.preventDefault(); row.scrollBy({left: row.clientWidth * 0.8, behavior:'smooth'}); }
    else if(e.key === 'ArrowLeft'){ e.preventDefault(); row.scrollBy({left: -row.clientWidth * 0.8, behavior:'smooth'}); }
  });
  // Wheel translate vertical -> horizontal
  row.addEventListener('wheel', e => {
    // If horizontal intent already, allow default
    if(Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    // Ignore with modifier keys (let browser zoom etc.)
    if(e.ctrlKey || e.metaKey) return;
    const factor = 1; // direct mapping for natural feel
    row.scrollBy({ left: e.deltaY * factor, behavior: 'auto' });
    e.preventDefault();
  }, { passive:false });
}

function skeletonRow(count=6){
  return Array.from({length:count}).map(()=>'<div class="skeleton skeleton-tile"></div>').join('');
}

function escapeHtml(str=''){return str.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}

function card(item){
  const img = escapeHtml(item.image||'');
  const title = escapeHtml(item.title||'Untitled');
  const score = item.score!=null? `<span class=\"hp-score\">★ ${item.score.toFixed(1)}</span>`: '';
  return `<a class="hp-card" href="#" data-id="${item.id}" title="${title}">
    <div class="hp-thumb-wrapper"><img loading="lazy" src="${img}" alt="${title}"></div>
    <div class="hp-meta">${title}${score}</div>
  </a>`;
}

function renderRow(el, items){
  el.innerHTML = items.map(card).join('');
  // After render, apply fade edges class if overflow
  requestAnimationFrame(()=>{
    const wrapper = el.closest('.hp-row-wrapper');
    if(!wrapper) return;
    const overflow = el.scrollWidth > el.clientWidth + 8;
    wrapper.classList.toggle('is-overflow', overflow);
  });
}

export async function initHomepage(){
  const tEl = trendingContainer();
  const pEl = popularContainer();
  if(!tEl || !pEl) return;
  tEl.innerHTML = skeletonRow(8);
  pEl.innerHTML = skeletonRow(8);
  try{
    const [trending, popular] = await Promise.all([
      fetchTrendingNow(12),
      fetchPopularSeason(12)
    ]);
  renderRow(tEl, trending.slice(0,18));
  renderRow(pEl, popular.slice(0,18));
  enableWheelHorizontal('row-trending');
  enableWheelHorizontal('row-popular');
    // Delegate click for detail
    [tEl,pEl].forEach(container=>{
      container.addEventListener('click', e=>{
        const card = e.target.closest('.hp-card');
        if(!card) return;
        e.preventDefault();
        const id = parseInt(card.getAttribute('data-id'),10);
        if(id) showAnimeDetail(id);
      });
    });
    window.addEventListener('resize', debounce(()=>{
      ['row-trending','row-popular'].forEach(id=>{
        const el = document.getElementById(id);
        if(!el) return; renderRow(el, [...el.querySelectorAll('.hp-card')].map(c=>({
          // reconstruct minimal card object from DOM (skip re-fetch). Not ideal but ok here.
          id: parseInt(c.getAttribute('data-id'),10),
          title: c.title,
          image: c.querySelector('img')?.getAttribute('src')||'',
          score: null
        })) );
      });
    }, 400));
  }catch(e){
    console.error('[OtakuTab] homepage rows error', e);
    tEl.innerHTML = '<div class="otk-error" role="status" aria-live="polite">Failed to load trending.</div>';
    pEl.innerHTML = '<div class="otk-error" role="status" aria-live="polite">Failed to load popular season.</div>';
  }
}

function debounce(fn, wait=300){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); };
}
