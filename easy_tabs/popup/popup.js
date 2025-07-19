/**
 * popup.js
 *
 * Script principal pentru popup-ul extensiei.
 * Acest script gestionează preluarea, gruparea și afișarea tab-urilor deschise,
 * permițând utilizatorului să le organizeze, grupeze sau închidă.
 */

// --- CONSTANTE ---
const SYSTEM_PAGES_GROUP = 'Pagini de sistem';
const GROUP_COLORS = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
const DEFAULT_FAVICON = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="%23999" d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/></svg>';

// --- Starea aplicației (State) ---
const state = {
  tabs: [],
  groups: {},
};

// --- Elemente DOM ---
const dom = {};

/**
 * Găsește și stochează referințele la elementele DOM necesare.
 */
function cacheDOMElements() {
  dom.groupsContainer = document.getElementById('groups');
  dom.loadingElement = document.getElementById('loading');
  dom.emptyState = document.getElementById('emptyState');
  dom.totalTabsElement = document.getElementById('totalTabs');
  dom.totalGroupsElement = document.getElementById('totalGroups');
  dom.closeAllButton = document.getElementById('closeAll');
  dom.refreshButton = document.getElementById('refreshGroups');
}

/**
 * Afișează sau ascunde diferite stări ale interfeței (încărcare, gol, conținut, eroare).
 * @param {'loading' | 'empty' | 'content' | 'error'} view - Starea de afișat.
 * @param {string} [errorMessage] - Mesajul de eroare de afișat (opțional).
 */
function setViewState(view, errorMessage) {
  dom.loadingElement.style.display = view === 'loading' ? 'block' : 'none';
  dom.emptyState.style.display = view === 'empty' || view === 'error' ? 'block' : 'none';
  dom.groupsContainer.style.display = view === 'content' ? 'block' : 'none';

  if (view === 'error') {
    dom.emptyState.innerHTML = `
      <div class="empty-icon"><i class="bi bi-exclamation-triangle"></i></div>
      <h5>Eroare la încărcarea tab-urilor</h5>
      <p>${errorMessage || 'Te rugăm să încerci să reîmprospătezi extensia.'}</p>
    `;
  } else if (view === 'empty') {
      dom.emptyState.innerHTML = `
        <div class="empty-icon"><i class="bi bi-moon-stars"></i></div>
        <h5>Nu există tab-uri deschise</h5>
        <p>Deschide câteva tab-uri pentru a începe organizarea.</p>
      `;
  }
}

/**
 * Grupează tab-urile după hostname.
 * @param {chrome.tabs.Tab[]} tabs - Lista de tab-uri de grupat.
 * @returns {Object.<string, chrome.tabs.Tab[]>} - Un obiect cu tab-uri grupate.
 */
function groupTabsByHostname(tabs) {
  const groups = {};
  for (const tab of tabs) {
    let groupName;
    try {
      const url = new URL(tab.url);
      groupName = url.hostname.replace('www.', '');
    } catch {
      groupName = SYSTEM_PAGES_GROUP;
    }
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(tab);
  }
  return groups;
}

/**
 * Actualizează contoarele pentru totalul de tab-uri și grupuri în UI.
 */
function updateStats() {
  dom.totalTabsElement.textContent = state.tabs.length;
  dom.totalGroupsElement.textContent = Object.keys(state.groups).length;
}

/**
 * Creează și returnează un element DOM pentru un singur tab.
 * @param {chrome.tabs.Tab} tab - Obiectul tab.
 * @returns {HTMLElement} - Elementul `div` pentru tab.
 */
function createTabElement(tab) {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';

    // Informații tab (favicon și titlu)
    const tabInfo = document.createElement('div');
    tabInfo.className = 'tab-info';
    
    const favicon = document.createElement('img');
    favicon.className = 'tab-favicon';
    favicon.src = tab.favIconUrl || DEFAULT_FAVICON;
    favicon.onerror = () => { favicon.src = DEFAULT_FAVICON; };

    const tabTitle = document.createElement('span');
    tabTitle.className = 'tab-title';
    tabTitle.textContent = tab.title || 'Fără titlu';
    tabTitle.title = tab.title;

    tabInfo.append(favicon, tabTitle);

    // Acțiuni tab (deschide, fixează, închide)
    const tabActions = document.createElement('div');
    tabActions.className = 'tab-actions';

    const createButton = (icon, title, className, action, tabId) => {
        const button = document.createElement('button');
        button.innerHTML = `<i class="bi ${icon}"></i>`;
        button.title = title;
        button.className = `btn-icon ${className}`;
        button.dataset.action = action;
        button.dataset.tabId = tabId;
        return button;
    };
    
    const openBtn = createButton('bi-eye', 'Comută la acest tab', 'btn-success-gradient', 'open-tab', tab.id);
    const pinBtn = createButton(
        tab.pinned ? 'bi-pin-angle-fill' : 'bi-pin-angle',
        tab.pinned ? 'Anulează fixarea' : 'Fixează tab-ul',
        tab.pinned ? 'btn-warning-gradient' : 'btn-primary-gradient',
        'pin-tab',
        tab.id
    );
    const closeBtn = createButton('bi-x', 'Închide acest tab', 'btn-danger-gradient', 'close-tab', tab.id);

    tabActions.append(openBtn, pinBtn, closeBtn);
    tabItem.append(tabInfo, tabActions);
    
    return tabItem;
}


/**
 * Creează și returnează un card de grup, inclusiv toate tab-urile sale.
 * @param {string} host - Numele grupului (hostname).
 * @param {chrome.tabs.Tab[]} groupTabs - Lista de tab-uri din grup.
 * @returns {HTMLElement} - Elementul `div` pentru cardul de grup.
 */
function createGroupCardElement(host, groupTabs) {
    const groupCard = document.createElement('div');
    groupCard.className = 'group-card';

    // Antet grup
    const groupHeader = document.createElement('div');
    groupHeader.className = 'group-header';

    const groupTitle = document.createElement('h6');
    groupTitle.className = 'group-title';
    groupTitle.innerHTML = `<i class="bi bi-globe"></i> ${host} <span class="tab-count">${groupTabs.length}</span>`;

    // Acțiuni grup
    const groupActions = document.createElement('div');
    groupActions.className = 'group-actions';

    const groupBtn = document.createElement('button');
    groupBtn.innerHTML = '<i class="bi bi-collection me-1"></i>Grupează';
    groupBtn.className = 'btn btn-sm btn-primary-gradient';
    groupBtn.dataset.action = 'group-tabs';
    groupBtn.dataset.host = host;

    const closeGroupBtn = document.createElement('button');
    closeGroupBtn.innerHTML = '<i class="bi bi-x-circle me-1"></i>Închide Grupul';
    closeGroupBtn.className = 'btn btn-sm btn-danger-gradient';
    closeGroupBtn.dataset.action = 'close-group';
    closeGroupBtn.dataset.host = host;

    groupActions.append(groupBtn, closeGroupBtn);
    groupHeader.append(groupTitle, groupActions);
    groupCard.appendChild(groupHeader);
    
    // Adaugă tab-urile individuale
    groupTabs.forEach(tab => {
        groupCard.appendChild(createTabElement(tab));
    });

    return groupCard;
}

/**
 * Randează toate grupurile de tab-uri în containerul principal.
 */
function render() {
  dom.groupsContainer.innerHTML = ''; // Curăță conținutul vechi

  if (state.tabs.length === 0) {
    setViewState('empty');
    updateStats();
    return;
  }

  // Sortează grupurile după numărul de tab-uri (descrescător)
  const sortedGroups = Object.entries(state.groups).sort((a, b) => b[1].length - a[1].length);

  for (const [host, groupTabs] of sortedGroups) {
    const groupCard = createGroupCardElement(host, groupTabs);
    dom.groupsContainer.appendChild(groupCard);
  }
  
  updateStats();
  setViewState('content');
}

// --- GESTIONAREA EVENIMENTELOR (EVENT HANDLERS) ---

/**
 * Gestionează clicurile pe butoanele de acțiune folosind delegarea evenimentelor.
 * @param {Event} event - Obiectul evenimentului de clic.
 */
async function handleActions(event) {
    const button = event.target.closest('button');
    if (!button) return;

    const { action, tabId, host } = button.dataset;
    if (!action) return;

    try {
        switch (action) {
            case 'open-tab':
                await chrome.tabs.update(parseInt(tabId), { active: true });
                const tab = await chrome.tabs.get(parseInt(tabId));
                await chrome.windows.update(tab.windowId, { focused: true });
                window.close();
                break;

            case 'close-tab':
                await chrome.tabs.remove(parseInt(tabId));
                await initialize(); // Re-inițializează pentru a reflecta schimbarea
                break;

            case 'pin-tab':
                const tabToPin = await chrome.tabs.get(parseInt(tabId));
                await chrome.tabs.update(parseInt(tabId), { pinned: !tabToPin.pinned });
                await initialize();
                break;

            case 'group-tabs':
                const tabsToGroup = state.groups[host].map(t => t.id);
                const groupId = await chrome.tabs.group({ tabIds: tabsToGroup });
                const randomColor = GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)];
                await chrome.tabGroups.update(groupId, { title: host, color: randomColor });
                
                // Feedback vizual
                button.innerHTML = '<i class="bi bi-check-circle me-1"></i>Grupat!';
                button.disabled = true;
                setTimeout(() => {
                    button.innerHTML = '<i class="bi bi-collection me-1"></i>Grupează';
                    button.disabled = false;
                }, 2000);
                break;

            case 'close-group':
                const tabsToClose = state.groups[host];
                if (confirm(`Ești sigur că vrei să închizi cele ${tabsToClose.length} tab-uri de la ${host}?`)) {
                    await chrome.tabs.remove(tabsToClose.map(t => t.id));
                    await initialize();
                }
                break;
        }
    } catch (error) {
        console.error(`Eroare la acțiunea '${action}':`, error);
        setViewState('error', error.message);
    }
}

/**
 * Gestionează închiderea tuturor tab-urilor.
 */
async function handleCloseAll() {
    if (state.tabs.length === 0) return;
    if (confirm(`Ești sigur că vrei să închizi toate cele ${state.tabs.length} tab-uri? Această acțiune nu poate fi anulată.`)) {
        try {
            await chrome.tabs.remove(state.tabs.map(t => t.id));
            await initialize();
        } catch (error) {
            console.error('Eroare la închiderea tuturor tab-urilor:', error);
            setViewState('error', error.message);
        }
    }
}

/**
 * Setează ascultătorii de evenimente pentru elementele statice.
 */
function setupEventListeners() {
    dom.groupsContainer.addEventListener('click', handleActions);
    dom.closeAllButton.addEventListener('click', handleCloseAll);
    dom.refreshButton.addEventListener('click', () => window.location.reload());
}

/**
 * Funcția principală de inițializare.
 * Preia tab-urile, le grupează și randează interfața.
 */
async function initialize() {
  setViewState('loading');
  try {
    state.tabs = await chrome.tabs.query({});
    state.groups = groupTabsByHostname(state.tabs);
    render();
  } catch (error) {
    console.error('Eroare la inițializare:', error);
    setViewState('error', error.message);
  }
}

// --- PUNCTUL DE INTRARE ---
document.addEventListener('DOMContentLoaded', () => {
  cacheDOMElements();
  setupEventListeners();
  initialize();
});
