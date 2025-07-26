// Initialize when DOM is ready
if (!window.hasTabManagerInit) {
  window.hasTabManagerInit = true;
  
  document.addEventListener("DOMContentLoaded", async () => {
    const tabListEl = document.getElementById("tab-list");
    const groupListEl = document.getElementById("group-list");

    let currentTabs = [];

    await refreshTabList();
    await renderGroups();

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
    document.getElementById("open-sidepanel").onclick = async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.sidePanel.open({ windowId: tab.windowId });
    };

    async function refreshTabList() {
      currentTabs = await chrome.tabs.query({});
      tabListEl.innerHTML = "";

      currentTabs.forEach(tab => {
        const li = document.createElement("li");
        li.className = "list-group-item bg-secondary text-light d-flex align-items-center";
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "form-check-input me-2";
        checkbox.setAttribute("data-id", tab.id);
        
        const img = document.createElement("img");
        img.src = tab.favIconUrl || '';
        img.width = 16;
        img.height = 16;
        img.className = "me-2";
        img.onerror = function() { this.style.display = 'none'; };
        
        const span = document.createElement("span");
        span.className = "text-truncate";
        span.title = tab.title;
        span.style.maxWidth = "200px";
        span.textContent = tab.title;
        
        li.appendChild(checkbox);
        li.appendChild(img);
        li.appendChild(span);
        tabListEl.appendChild(li);
      });
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
        const id = `group-${index}`;
        const wrapper = document.createElement("div");
        wrapper.className = "accordion-item bg-dark text-light border-secondary";

        wrapper.innerHTML = `
          <h2 class="accordion-header" id="heading-${id}">
            <button class="accordion-button collapsed bg-secondary text-light" type="button" data-group-toggle="${id}">
              ${group.name}
            </button>
          </h2>
          <div id="collapse-${id}" class="accordion-collapse collapse" style="display: none;">
            <div class="accordion-body">
              <ul class="list-group mb-2">
                ${group.urls.map(url => `<li class="list-group-item list-group-item-dark text-truncate" title="${url}">${url}</li>`).join("")}
              </ul>
              <button class="btn btn-sm btn-success me-2" data-action="restore" data-name="${group.name}">🔄 Restore</button>
              <button class="btn btn-sm btn-warning me-2" data-action="rename" data-name="${group.name}">✏️ Rename</button>
              <button class="btn btn-sm btn-danger" data-action="delete" data-name="${group.name}">🗑️ Delete</button>
            </div>
          </div>
        `;
        groupListEl.appendChild(wrapper);
      });

      groupListEl.querySelectorAll("button[data-action]").forEach(btn => {
        const name = btn.getAttribute("data-name");
        const action = btn.getAttribute("data-action");
        btn.onclick = () => handleGroupAction(action, name);
      });

      // Handle accordion toggle manually
      groupListEl.querySelectorAll("button[data-group-toggle]").forEach(btn => {
        const targetId = btn.getAttribute("data-group-toggle");
        btn.onclick = () => {
          const target = document.getElementById(`collapse-${targetId}`);
          const isHidden = target.style.display === 'none';
          
          // Close all other accordions
          groupListEl.querySelectorAll('.accordion-collapse').forEach(el => {
            el.style.display = 'none';
          });
          
          // Toggle current accordion
          target.style.display = isHidden ? 'block' : 'none';
        };
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
}