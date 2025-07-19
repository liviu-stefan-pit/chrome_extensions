/**
 * popup.js
 *
 * Main script for the extension's popup.
 * Handles fetching, grouping, and displaying open tabs,
 * allowing the user to search, organize, group, or close them.
 */

// --- CONSTANTS ---
const SYSTEM_PAGES_GROUP = 'System Pages';
const GROUP_COLORS = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
const DEFAULT_FAVICON = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="%23999" d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/></svg>';

// --- Application State ---
const state = {
  tabs: [],
  groups: {},
  searchTerm: '',
  collapsedGroups: new Set(),
};

// --- DOM Elements ---
const dom = {};

/**
 * Finds and caches references to required DOM elements.
 */
function cacheDOMElements() {
  dom.groupsContainer = document.getElementById('groups');
  dom.loadingElement = document.getElementById('loading');
  dom.emptyState = document.getElementById('emptyState');
  dom.emptyStateTitle = document.getElementById('emptyStateTitle');
  dom.emptyStateMessage = document.getElementById('emptyStateMessage');
  dom.totalTabsElement = document.getElementById('totalTabs');
  dom.totalGroupsElement = document.getElementById('totalGroups');
  dom.closeAllButton = document.getElementById('closeAll');
  dom.closeDuplicatesButton = document.getElementById('closeDuplicates'); // NEW
  dom.refreshButton = document.getElementById('refreshGroups');
  dom.searchInput = document.getElementById('searchInput');
  dom.tabPreview = document.getElementById('tab-preview');
}

/**
 * Displays or hides different UI states (loading, empty, content, error).
 * @param {'loading' | 'empty' | 'content' | 'error'} view - The view to display.
 * @param {string} [errorMessage] - Optional error message.
 */
function setViewState(view, errorMessage) {
  dom.loadingElement.style.display = view === 'loading' ? 'block' : 'none';
  dom.emptyState.style.display = view === 'empty' || view === 'error' ? 'block' : 'none';
  dom.groupsContainer.style.display = view === 'content' ? 'block' : 'none';

  if (view === 'error') {
    dom.emptyStateTitle.textContent = 'Error Loading Tabs';
    dom.emptyStateMessage.textContent = errorMessage || 'Please try refreshing the extension.';
  } else if (view === 'empty') {
      if(state.searchTerm) {
        dom.emptyStateTitle.textContent = 'No Results Found';
        dom.emptyStateMessage.textContent = `No tabs found matching "${state.searchTerm}".`;
      } else {
        dom.emptyStateTitle.textContent = 'No Open Tabs';
        dom.emptyStateMessage.textContent = 'Open some tabs to start organizing.';
      }
  }
}

/**
 * Groups tabs by their hostname.
 * @param {chrome.tabs.Tab[]} tabs - The list of tabs to group.
 * @returns {Object.<string, chrome.tabs.Tab[]>} An object of grouped tabs.
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
 * Updates the total tab and group counters in the UI.
 * @param {number} groupCount - The number of groups to display.
 */
function updateStats(groupCount) {
  dom.totalTabsElement.textContent = state.tabs.length;
  dom.totalGroupsElement.textContent = groupCount;
}

/**
 * Creates and returns a DOM element for a single tab.
 * @param {chrome.tabs.Tab} tab - The tab object.
 * @returns {HTMLElement} The tab's div element.
 */
function createTabElement(tab) {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    tabItem.dataset.tabId = tab.id;

    const tabInfo = document.createElement('div');
    tabInfo.className = 'tab-info';
    
    const favicon = document.createElement('img');
    favicon.className = 'tab-favicon';
    favicon.src = tab.favIconUrl || DEFAULT_FAVICON;
    favicon.onerror = () => { favicon.src = DEFAULT_FAVICON; };

    const tabTitle = document.createElement('span');
    tabTitle.className = 'tab-title';
    tabTitle.textContent = tab.title || 'Untitled';
    tabTitle.title = tab.title;

    tabInfo.append(favicon, tabTitle);

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
    
    const openBtn = createButton('bi-eye', 'Switch to this tab', 'btn-success-gradient', 'open-tab', tab.id);
    const pinBtn = createButton(tab.pinned ? 'bi-pin-angle-fill' : 'bi-pin-angle', tab.pinned ? 'Unpin tab' : 'Pin tab', tab.pinned ? 'btn-warning-gradient' : 'btn-primary-gradient', 'pin-tab', tab.id);
    const closeBtn = createButton('bi-x', 'Close this tab', 'btn-danger-gradient', 'close-tab', tab.id);

    tabActions.append(openBtn, pinBtn, closeBtn);
    tabItem.append(tabInfo, tabActions);
    
    return tabItem;
}

/**
 * Creates and returns a group card element, including all its tabs.
 * @param {string} host - The group name (hostname).
 * @param {chrome.tabs.Tab[]} groupTabs - The list of tabs in the group.
 * @returns {HTMLElement} The group card's div element.
 */
function createGroupCardElement(host, groupTabs) {
    const groupCard = document.createElement('div');
    groupCard.className = 'group-card';
    if (state.collapsedGroups.has(host)) {
        groupCard.classList.add('collapsed');
    }

    const groupHeader = document.createElement('div');
    groupHeader.className = 'group-header';
    groupHeader.dataset.host = host; // For identifying which group was clicked

    const groupTitle = document.createElement('h6');
    groupTitle.className = 'group-title';
    groupTitle.innerHTML = `<i class="bi bi-chevron-down collapse-icon"></i> <i class="bi bi-globe"></i> ${host} <span class="tab-count">${groupTabs.length}</span>`;

    const groupActions = document.createElement('div');
    groupActions.className = 'group-actions';

    const groupBtn = document.createElement('button');
    groupBtn.innerHTML = '<i class="bi bi-collection me-1"></i>Group';
    groupBtn.className = 'btn btn-sm btn-primary-gradient';
    groupBtn.dataset.action = 'group-tabs';
    groupBtn.dataset.host = host;

    const closeGroupBtn = document.createElement('button');
    closeGroupBtn.innerHTML = '<i class="bi bi-x-circle me-1"></i>Close Group';
    closeGroupBtn.className = 'btn btn-sm btn-danger-gradient';
    closeGroupBtn.dataset.action = 'close-group';
    closeGroupBtn.dataset.host = host;

    groupActions.append(groupBtn, closeGroupBtn);
    groupHeader.append(groupTitle, groupActions);
    
    const tabList = document.createElement('div');
    tabList.className = 'tab-list';
    groupTabs.forEach(tab => {
        tabList.appendChild(createTabElement(tab));
    });

    groupCard.append(groupHeader, tabList);
    return groupCard;
}

/**
 * Renders all tab groups into the main container, applying search filter.
 */
function render() {
  dom.groupsContainer.innerHTML = '';

  let groupsToRender = state.groups;
  
  if (state.searchTerm) {
    const lowerCaseSearch = state.searchTerm.toLowerCase();
    const filteredGroups = {};
    for (const host in state.groups) {
      const matchingTabs = state.groups[host].filter(tab =>
        (tab.title && tab.title.toLowerCase().includes(lowerCaseSearch)) ||
        (tab.url && tab.url.toLowerCase().includes(lowerCaseSearch))
      );
      if (matchingTabs.length > 0) {
        filteredGroups[host] = matchingTabs;
      }
    }
    groupsToRender = filteredGroups;
  }
  
  const sortedGroups = Object.entries(groupsToRender).sort((a, b) => b[1].length - a[1].length);
  
  if (sortedGroups.length === 0) {
    setViewState('empty');
    updateStats(0);
    return;
  }

  for (const [host, groupTabs] of sortedGroups) {
    const groupCard = createGroupCardElement(host, groupTabs);
    dom.groupsContainer.appendChild(groupCard);
  }
  
  updateStats(sortedGroups.length);
  setViewState('content');
}

// --- EVENT HANDLERS ---

/**
 * Handles clicks within the groups container, delegating to other functions.
 * @param {Event} event - The click event object.
 */
function handleContainerClick(event) {
    const groupHeader = event.target.closest('.group-header');
    const actionButton = event.target.closest('button[data-action]');

    if (actionButton) {
        handleActionClick(actionButton);
    } else if (groupHeader) {
        handleToggleCollapse(groupHeader);
    }
}

/**
 * Handles clicks on action buttons (open, close, pin, etc.).
 * @param {HTMLElement} button - The button element that was clicked.
 */
async function handleActionClick(button) {
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
                await initialize();
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
                button.innerHTML = '<i class="bi bi-check-circle me-1"></i>Grouped!';
                button.disabled = true;
                setTimeout(() => {
                    button.innerHTML = '<i class="bi bi-collection me-1"></i>Group';
                    button.disabled = false;
                }, 2000);
                break;
            case 'close-group':
                const tabsToClose = state.groups[host];
                if (confirm(`Are you sure you want to close the ${tabsToClose.length} tabs from ${host}?`)) {
                    await chrome.tabs.remove(tabsToClose.map(t => t.id));
                    await initialize();
                }
                break;
        }
    } catch (error) {
        console.error(`Error performing action '${action}':`, error);
        setViewState('error', error.message);
    }
}

/** Handles closing all tabs. */
async function handleCloseAll() {
    if (state.tabs.length === 0) return;
    if (confirm(`Are you sure you want to close all ${state.tabs.length} tabs? This action cannot be undone.`)) {
        try {
            await chrome.tabs.remove(state.tabs.map(t => t.id));
            await initialize();
        } catch (error) {
            console.error('Error closing all tabs:', error);
            setViewState('error', error.message);
        }
    }
}

/** NEW: Finds and closes duplicate tabs. */
async function handleCloseDuplicates() {
    const urlMap = new Map();
    const duplicateIds = [];
    for (const tab of state.tabs) {
        if (urlMap.has(tab.url)) {
            duplicateIds.push(tab.id);
        } else {
            urlMap.set(tab.url, tab.id);
        }
    }

    if (duplicateIds.length === 0) {
        alert('No duplicate tabs found.');
        return;
    }

    if (confirm(`Found ${duplicateIds.length} duplicate tabs. Do you want to close them?`)) {
        try {
            await chrome.tabs.remove(duplicateIds);
            await initialize();
        } catch (error) {
            console.error('Error closing duplicate tabs:', error);
            setViewState('error', error.message);
        }
    }
}

/** NEW: Toggles the collapsed state of a group. */
function handleToggleCollapse(groupHeader) {
    const host = groupHeader.dataset.host;
    const groupCard = groupHeader.closest('.group-card');
    
    if (state.collapsedGroups.has(host)) {
        state.collapsedGroups.delete(host);
        groupCard.classList.remove('collapsed');
    } else {
        state.collapsedGroups.add(host);
        groupCard.classList.add('collapsed');
    }
}

/** Handles real-time search input. */
function handleSearch(event) {
    state.searchTerm = event.target.value;
    render();
}

/** Handles showing and hiding the tab preview on hover. */
function handleTabHover(event) {
    const tabItem = event.target.closest('.tab-item');
    
    if (event.type === 'mouseover' && tabItem) {
        const tabId = parseInt(tabItem.dataset.tabId);
        const tab = state.tabs.find(t => t.id === tabId);
        if (!tab) return;

        dom.tabPreview.innerHTML = `
            <img src="${tab.favIconUrl || DEFAULT_FAVICON}" class="preview-favicon" alt="">
            <div class="preview-text">
                <div class="preview-title">${tab.title || 'Untitled'}</div>
                <div class="preview-url">${tab.url || ''}</div>
            </div>
        `;

        const rect = tabItem.getBoundingClientRect();
        dom.tabPreview.style.top = `${rect.bottom + 5}px`;
        dom.tabPreview.style.left = `20px`;
        dom.tabPreview.classList.add('visible');
    } else if (event.type === 'mouseout') {
        dom.tabPreview.classList.remove('visible');
    }
}

/** Sets up event listeners for static elements. */
function setupEventListeners() {
    dom.groupsContainer.addEventListener('click', handleContainerClick);
    dom.closeAllButton.addEventListener('click', handleCloseAll);
    dom.closeDuplicatesButton.addEventListener('click', handleCloseDuplicates);
    dom.refreshButton.addEventListener('click', () => window.location.reload());
    dom.searchInput.addEventListener('input', handleSearch);
    dom.groupsContainer.addEventListener('mouseover', handleTabHover);
    dom.groupsContainer.addEventListener('mouseout', handleTabHover);
}

/** Main initialization function. */
async function initialize() {
  setViewState('loading');
  try {
    state.tabs = await chrome.tabs.query({});
    state.groups = groupTabsByHostname(state.tabs);
    render();
  } catch (error) {
    console.error('Initialization error:', error);
    setViewState('error', error.message);
  }
}

// --- ENTRY POINT ---
document.addEventListener('DOMContentLoaded', () => {
  cacheDOMElements();
  setupEventListeners();
  initialize();
});
