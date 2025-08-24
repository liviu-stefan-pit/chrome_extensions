import { fetchTrendingNow, fetchPopularSeason } from '../api/anilist-only.js';

const trendingContainer = () => document.getElementById('row-trending');
const popularContainer = () => document.getElementById('row-popular');

function attachScrollerControls(rowId){
  const row = document.getElementById(rowId);
  const wrapper = row?.closest('.hp-row-wrapper');
  if(!row || !wrapper) return;
  // Avoid duplicating controls
  if(wrapper.querySelector('.hp-nav')) return;
  const nav = document.createElement('div');
  nav.className = 'hp-nav';
  nav.innerHTML = `
    <button class="hp-btn prev" aria-label="Scroll left" data-dir="-1" tabindex="0">◂</button>
    <button class="hp-btn next" aria-label="Scroll right" data-dir="1" tabindex="0">▸</button>
  `;
  wrapper.appendChild(nav);
  const step = () => Math.round(row.clientWidth * 0.85);
  function doScroll(dir){
    row.scrollBy({left: dir * step(), behavior: 'smooth'});
  }
  nav.addEventListener('click', e=>{
    const btn = e.target.closest('button[data-dir]');
    if(!btn) return;
    doScroll(parseInt(btn.dataset.dir,10));
  });
  // Keyboard support (row focus + arrows)
  row.setAttribute('tabindex','0');
  row.addEventListener('keydown', e=>{
    if(e.key==='ArrowRight'){ e.preventDefault(); doScroll(1);} else if(e.key==='ArrowLeft'){ e.preventDefault(); doScroll(-1);} });
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ wrapper.classList.add('in-view'); io.disconnect(); }
    });
  }, {threshold:0.1});
  io.observe(row);
}

function skeletonRow(count=6){
  return Array.from({length:count}).map(()=>'<div class="skeleton skeleton-tile"></div>').join('');
}

function escapeHtml(str=''){return str.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}

function card(item){
  const img = escapeHtml(item.image||'');
  const title = escapeHtml(item.title||'Untitled');
  const score = item.score!=null? `<span class=\"hp-score\">★ ${item.score.toFixed(1)}</span>`: '';
  return `<a class="hp-card" href="${item.url}" target="_blank" rel="noopener" title="${title}">
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
    attachScrollerControls('row-trending');
    attachScrollerControls('row-popular');
    window.addEventListener('resize', debounce(()=>{
      ['row-trending','row-popular'].forEach(id=>{
        const el = document.getElementById(id);
        if(!el) return; renderRow(el, [...el.querySelectorAll('.hp-card')].map(c=>({
          // reconstruct minimal card object from DOM (skip re-fetch). Not ideal but ok here.
          title: c.title,
          image: c.querySelector('img')?.getAttribute('src')||'',
          url: c.getAttribute('href')||'',
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
