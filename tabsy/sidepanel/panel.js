// Simple load test
console.log("Panel.js: File loaded successfully");

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Panel.js: DOM loaded, starting initialization...");
  
  const root = document.getElementById("panel-root");
  const tabCountEl = document.getElementById("tab-count");
  
  if (!root) {
    console.error("Panel.js: Could not find panel-root element");
    return;
  }
  
  if (!tabCountEl) {
    console.error("Panel.js: Could not find tab-count element");
    return;
  }
  
  console.log("Panel.js: Found required DOM elements");

  // Create the same UI structure as popup without the side panel button
  root.innerHTML = `
    <!-- Action Bar -->
    <div class="action-bar">
      <button id="clean-tabs" class="btn btn-action btn-primary" data-tooltip="Removes duplicate tabs and empty pages (keeps important browser tabs)">
        <span class="btn-icon">🧹</span>
        <span class="btn-text">Clean Tabs</span>
      </button>
      <button id="refresh-tabs" class="btn btn-action btn-secondary" data-tooltip="Refresh tab list">
        <span class="btn-icon">🔄</span>
        <span class="btn-text">Refresh</span>
      </button>
    </div>

    <!-- Tab List -->
    <div class="content-section">
      <div class="section-header">
        <h2>Active Tabs</h2>
      </div>
      <div class="tab-list-container">
        <ul id="tab-list" class="tab-list"></ul>
      </div>
    </div>

    <!-- Save Group Section -->
    <div class="content-section">
      <div class="section-header">
        <h2>Save Tab Group</h2>
      </div>
      <div class="save-group-form">
        <div class="form-group">
          <input id="group-name" type="text" class="form-input" placeholder="Enter group name..." />
          <button id="save-group" class="btn btn-action btn-success">
            <span class="btn-icon">💾</span>
            <span class="btn-text">Save Selected</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Saved Groups -->
    <div class="content-section">
      <div class="section-header">
        <h2>Saved Groups</h2>
      </div>
      <div id="group-list" class="group-list"></div>
    </div>
  `;

  // Initialize the same functionality as popup
  const tabListEl = document.getElementById("tab-list");
  const groupListEl = document.getElementById("group-list");

  if (!tabListEl) {
    console.error("Panel.js: Could not find tab-list element");
    return;
  }
  
  if (!groupListEl) {
    console.error("Panel.js: Could not find group-list element");
    return;
  }
  
  console.log("Panel.js: Found all required elements, checking dependencies...");
  
  // Check if dependencies are loaded
  if (typeof TabUtils === 'undefined') {
    console.error("Panel.js: TabUtils not loaded");
    return;
  }
  
  if (typeof GroupsStorage === 'undefined') {
    console.error("Panel.js: GroupsStorage not loaded");
    return;
  }
  
  console.log("Panel.js: All dependencies loaded, initializing...");

  let currentTabs = [];

  try {
    await refreshTabList();
    await renderGroups();
    console.log("Panel.js: Initialization complete");
  } catch (error) {
    console.error("Panel.js: Error during initialization:", error);
  }

  document.getElementById("refresh-tabs").onclick = refreshTabList;
  document.getElementById("clean-tabs").onclick = async () => {
    try {
      await TabUtils.cleanTabs();
      await refreshTabList(); // Refresh the tab list after cleaning
    } catch (error) {
      console.error('Error cleaning tabs:', error);
      alert('Error cleaning tabs: ' + error.message);
    }
  };
  document.getElementById("save-group").onclick = saveGroup;

  async function refreshTabList() {
    try {
      console.log("Panel.js: Refreshing tab list...");
      currentTabs = await chrome.tabs.query({});
      console.log("Panel.js: Found", currentTabs.length, "tabs");
      tabListEl.innerHTML = "";
      
      // Update tab count
      tabCountEl.textContent = `${currentTabs.length} tab${currentTabs.length !== 1 ? 's' : ''}`;

      currentTabs.forEach(tab => {
        const li = document.createElement("li");
        li.className = "tab-item";
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "tab-checkbox";
        checkbox.setAttribute("data-id", tab.id);
        
        const img = document.createElement("img");
      img.src = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline></svg>';
      img.className = "tab-favicon";
      img.onerror = function() { 
        this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline></svg>';
      };
      
      const span = document.createElement("span");
      span.className = "tab-title";
      span.textContent = tab.title || 'Untitled';
      span.title = tab.title;
      
      li.appendChild(checkbox);
      li.appendChild(img);
      li.appendChild(span);
      tabListEl.appendChild(li);
    });
    console.log("Panel.js: Tab list rendered");
  } catch (error) {
    console.error("Panel.js: Error refreshing tab list:", error);
  }
}

  async function saveGroup() {
    const name = document.getElementById("group-name").value.trim();
    if (!name) return alert("Group name required");

    const tabsToSave = [...tabListEl.querySelectorAll("input[type='checkbox']:checked")];
    if (!tabsToSave.length) return alert("Select at least one tab");

    const urls = tabsToSave.map(checkbox => {
      const tabId = parseInt(checkbox.getAttribute("data-id"));
      return currentTabs.find(t => t.id === tabId)?.url;
    }).filter(Boolean);

    try {
      await GroupsStorage.save(name, urls);
      document.getElementById("group-name").value = "";
      await renderGroups();
    } catch (e) {
      alert(e.message);
    }
  }

  async function renderGroups() {
    const groups = await GroupsStorage.getAll();
    groupListEl.innerHTML = "";

    groups.forEach((group, index) => {
      const groupItem = document.createElement("div");
      groupItem.className = "group-item";
      
      const groupHeader = document.createElement("div");
      groupHeader.className = "group-header";
      
      const groupTitle = document.createElement("div");
      groupTitle.className = "group-title";
      groupTitle.textContent = group.name;
      
      const groupToggle = document.createElement("div");
      groupToggle.className = "group-toggle";
      groupToggle.textContent = "▼";
      
      groupHeader.appendChild(groupTitle);
      groupHeader.appendChild(groupToggle);
      
      const groupContent = document.createElement("div");
      groupContent.className = "group-content";
      
      const groupUrls = document.createElement("ul");
      groupUrls.className = "group-urls";
      
      group.urls.forEach(url => {
        const li = document.createElement("li");
        li.className = "group-url";
        li.textContent = url;
        li.title = url;
        groupUrls.appendChild(li);
      });
      
      const groupActions = document.createElement("div");
      groupActions.className = "group-actions";
      
      const restoreBtn = document.createElement("button");
      restoreBtn.className = "btn btn-success";
      restoreBtn.innerHTML = '<span class="btn-icon">🔄</span><span class="btn-text">Restore</span>';
      restoreBtn.onclick = () => handleGroupAction("restore", group.name);
      
      const renameBtn = document.createElement("button");
      renameBtn.className = "btn btn-secondary";
      renameBtn.innerHTML = '<span class="btn-icon">✏️</span><span class="btn-text">Rename</span>';
      renameBtn.onclick = () => handleGroupAction("rename", group.name);
      
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-outline";
      deleteBtn.innerHTML = '<span class="btn-icon">🗑️</span><span class="btn-text">Delete</span>';
      deleteBtn.onclick = () => handleGroupAction("delete", group.name);
      
      groupActions.appendChild(restoreBtn);
      groupActions.appendChild(renameBtn);
      groupActions.appendChild(deleteBtn);
      
      groupContent.appendChild(groupUrls);
      groupContent.appendChild(groupActions);
      
      groupItem.appendChild(groupHeader);
      groupItem.appendChild(groupContent);
      
      // Toggle functionality
      groupHeader.onclick = () => {
        groupItem.classList.toggle('expanded');
      };
      
      groupListEl.appendChild(groupItem);
    });
  }

  async function handleGroupAction(action, name) {
    try {
      if (action === "restore") {
        await GroupsStorage.restore(name);
      } else if (action === "rename") {
        const newName = prompt("Enter new group name", name);
        if (!newName || newName === name) return;
        await GroupsStorage.rename(name, newName);
      } else if (action === "delete") {
        if (confirm(`Delete group "${name}"?`)) {
          await GroupsStorage.delete(name);
        }
      }
      await renderGroups();
    } catch (e) {
      alert(e.message);
    }
  }
});
