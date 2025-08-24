import { fetchCurrentSeason } from '../api/jikan.js';

const gridEl = () => document.getElementById('highlights-grid');
const errorEl = () => document.getElementById('highlights-error');
const refreshBtn = () => document.getElementById('refresh-highlights');

function renderSkeleton(count=6){
  const grid = gridEl();
  if(!grid) return;
  grid.classList.add('skeleton-grid');
  grid.innerHTML = Array.from({length:count}).map(()=>'<div class="skeleton skeleton-item"></div>').join('');
}
function clearSkeleton(){
  const grid = gridEl();
  if(!grid) return; grid.classList.remove('skeleton-grid');
}
function escapeHtml(str=''){return str.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}

function pickSubset(items,max=12){
  if(items.length<=max) return items;
  // Weighted pick: favor higher score
  return items
    .slice()
    .sort((a,b)=> (b?.score??0) - (a?.score??0))
    .slice(0,max);
}

function render(items){
  const grid = gridEl();
  grid.innerHTML = items.map(anime=>{
    const img = anime?.images?.jpg?.image_url || anime?.images?.webp?.image_url || '';
    const title = escapeHtml(anime?.title || 'Untitled');
    const score = anime?.score != null ? anime.score.toFixed(1) : null;
    return `<a class="otk-highlight-card" href="${anime?.url}" target="_blank" rel="noopener noreferrer" role="listitem">
      <img src="${img}" alt="${title} key visual">
      <div class="otk-highlight-info">
        <h3 class="otk-highlight-title">${title}</h3>
        ${score ? `<span class="otk-highlight-score" title="Score">★ ${score}</span>` : ''}
      </div>
    </a>`;
  }).join('');
}

async function load(){
  try{
    renderSkeleton();
    const data = await fetchCurrentSeason();
    const list = Array.isArray(data) ? data : [];
    clearSkeleton();
    if(!list.length){
  gridEl().innerHTML = '<div class="otk-error">No current season highlights available.</div>';
      return;
    }
    const subset = pickSubset(list, 12);
    render(subset);
  }catch(e){
    clearSkeleton();
    errorEl().textContent = 'Failed to load current season highlights.';
    errorEl().classList.remove('hidden');
    console.error('[OtakuTab] current season highlights load error', e);
  }
}

export function initHighlights(){
  if(!gridEl()) return;
  load();
  const btn = refreshBtn();
  if(btn){
    btn.addEventListener('click', () => load());
  }
}
