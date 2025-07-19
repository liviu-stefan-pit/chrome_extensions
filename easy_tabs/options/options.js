/**
 * options.js
 *
 * Handles the options page functionality for Easy Tabs extension.
 * Allows users to choose between popup and side panel display modes.
 */

// DOM elements
let panelOption, popupOption, saveButton, saveStatus;
let panelRadio, popupRadio;

// Initialize the options page
document.addEventListener('DOMContentLoaded', async () => {
  initializeElements();
  await loadSettings();
  setupEventListeners();
});

/**
 * Cache DOM element references
 */
function initializeElements() {
  panelOption = document.getElementById('panelOption');
  popupOption = document.getElementById('popupOption');
  saveButton = document.getElementById('saveButton');
  saveStatus = document.getElementById('saveStatus');
  panelRadio = document.getElementById('panel');
  popupRadio = document.getElementById('popup');
}

/**
 * Load current settings from storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get('displayMode');
    const displayMode = result.displayMode || 'panel';
    
    // Set the appropriate radio button
    if (displayMode === 'panel') {
      panelRadio.checked = true;
      panelOption.classList.add('selected');
    } else {
      popupRadio.checked = true;
      popupOption.classList.add('selected');
    }
    
    console.log('Loaded settings:', { displayMode });
  } catch (error) {
    console.error('Error loading settings:', error);
    // Default to panel mode
    panelRadio.checked = true;
    panelOption.classList.add('selected');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Option card click handlers
  panelOption.addEventListener('click', () => {
    selectOption('panel');
  });
  
  popupOption.addEventListener('click', () => {
    selectOption('popup');
  });
  
  // Radio button change handlers
  panelRadio.addEventListener('change', () => {
    if (panelRadio.checked) {
      selectOption('panel');
    }
  });
  
  popupRadio.addEventListener('change', () => {
    if (popupRadio.checked) {
      selectOption('popup');
    }
  });
  
  // Save button handler
  saveButton.addEventListener('click', saveSettings);
  
  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.target === panelOption || e.target.closest('#panelOption')) {
        e.preventDefault();
        selectOption('panel');
      } else if (e.target === popupOption || e.target.closest('#popupOption')) {
        e.preventDefault();
        selectOption('popup');
      }
    }
  });
}

/**
 * Select an option and update UI
 */
function selectOption(mode) {
  // Update radio buttons
  if (mode === 'panel') {
    panelRadio.checked = true;
    popupRadio.checked = false;
    panelOption.classList.add('selected');
    popupOption.classList.remove('selected');
  } else {
    popupRadio.checked = true;
    panelRadio.checked = false;
    popupOption.classList.add('selected');
    panelOption.classList.remove('selected');
  }
  
  // Hide save status when selection changes
  hideStatus();
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  try {
    const displayMode = panelRadio.checked ? 'panel' : 'popup';
    
    // Save to storage
    await chrome.storage.sync.set({ displayMode });
    
    console.log('Settings saved:', { displayMode });
    
    // Show success message
    showStatus('Settings saved successfully!', 'success');
    
    // The background script will automatically update the extension behavior
    // due to the storage.onChanged listener
    
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings. Please try again.', 'error');
  }
}

/**
 * Show status message
 */
function showStatus(message, type = 'success') {
  const icon = saveStatus.querySelector('i');
  const textNode = saveStatus.childNodes[saveStatus.childNodes.length - 1];
  
  if (type === 'success') {
    icon.className = 'bi bi-check-circle-fill';
    saveStatus.style.color = '#4ade80';
  } else {
    icon.className = 'bi bi-exclamation-triangle-fill';
    saveStatus.style.color = '#f87171';
  }
  
  // Update text content
  if (textNode.nodeType === Node.TEXT_NODE) {
    textNode.textContent = ' ' + message;
  } else {
    saveStatus.appendChild(document.createTextNode(' ' + message));
  }
  
  saveStatus.style.display = 'flex';
  
  // Auto-hide after 3 seconds
  setTimeout(hideStatus, 3000);
}

/**
 * Hide status message
 */
function hideStatus() {
  saveStatus.style.display = 'none';
}

// Make option cards focusable for accessibility
panelOption?.setAttribute('tabindex', '0');
popupOption?.setAttribute('tabindex', '0');
