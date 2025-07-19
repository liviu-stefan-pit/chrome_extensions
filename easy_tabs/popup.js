document.addEventListener('DOMContentLoaded', async () => {
  const groupsContainer = document.getElementById('groups');
  const loadingElement = document.getElementById('loading');
  const emptyState = document.getElementById('emptyState');
  const totalTabsElement = document.getElementById('totalTabs');
  const totalGroupsElement = document.getElementById('totalGroups');

  try {
    const tabs = await chrome.tabs.query({});
    
    // Hide loading
    loadingElement.style.display = 'none';
    
    if (tabs.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    // Show groups container
    groupsContainer.style.display = 'block';

    const groups = {};
    for (const tab of tabs) {
      try {
        const url = new URL(tab.url);
        const hostname = url.hostname.replace('www.', '');
        if (!groups[hostname]) groups[hostname] = [];
        groups[hostname].push(tab);
      } catch {
        // Handle special pages like chrome:// or extension pages
        const specialGroup = 'System Pages';
        if (!groups[specialGroup]) groups[specialGroup] = [];
        groups[specialGroup].push(tab);
      }
    }

    // Update stats
    totalTabsElement.textContent = tabs.length;
    totalGroupsElement.textContent = Object.keys(groups).length;

    // Sort groups by tab count (descending)
    const sortedGroups = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);

    for (const [host, groupTabs] of sortedGroups) {
      const groupCard = document.createElement('div');
      groupCard.className = 'group-card';

      const groupHeader = document.createElement('div');
      groupHeader.className = 'group-header';

      const groupTitle = document.createElement('h6');
      groupTitle.className = 'group-title';
      groupTitle.innerHTML = `
        <i class="bi bi-globe"></i>
        ${host}
        <span class="tab-count">${groupTabs.length}</span>
      `;

      const groupActions = document.createElement('div');
      groupActions.className = 'group-actions';

      const groupBtn = document.createElement('button');
      groupBtn.innerHTML = '<i class="bi bi-collection me-1"></i>Group Tabs';
      groupBtn.className = 'btn btn-sm btn-primary-gradient';
      groupBtn.onclick = async () => {
        try {
          const tabIds = groupTabs.map(t => t.id);
          const groupId = await chrome.tabs.group({ tabIds });
          const colors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          await chrome.tabGroups.update(groupId, { title: host, color: randomColor });
          
          // Show success feedback
          groupBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Grouped!';
          groupBtn.disabled = true;
          setTimeout(() => {
            groupBtn.innerHTML = '<i class="bi bi-collection me-1"></i>Group Tabs';
            groupBtn.disabled = false;
          }, 2000);
        } catch (error) {
          console.error('Error grouping tabs:', error);
        }
      };

      const closeGroupBtn = document.createElement('button');
      closeGroupBtn.innerHTML = '<i class="bi bi-x-circle me-1"></i>Close Group';
      closeGroupBtn.className = 'btn btn-sm btn-danger-gradient';
      closeGroupBtn.onclick = async () => {
        if (confirm(`Close all ${groupTabs.length} tabs from ${host}?`)) {
          try {
            const tabIds = groupTabs.map(t => t.id);
            await chrome.tabs.remove(tabIds);
            groupCard.remove();
            
            // Update stats
            const remainingTabs = parseInt(totalTabsElement.textContent) - groupTabs.length;
            const remainingGroups = parseInt(totalGroupsElement.textContent) - 1;
            totalTabsElement.textContent = remainingTabs;
            totalGroupsElement.textContent = remainingGroups;
            
            // Show empty state if no tabs left
            if (remainingTabs === 0) {
              groupsContainer.style.display = 'none';
              emptyState.style.display = 'block';
            }
          } catch (error) {
            console.error('Error closing group:', error);
          }
        }
      };

      groupActions.appendChild(groupBtn);
      groupActions.appendChild(closeGroupBtn);
      groupHeader.appendChild(groupTitle);
      groupHeader.appendChild(groupActions);
      groupCard.appendChild(groupHeader);

      // Add individual tabs
      groupTabs.forEach((tab, index) => {
        const tabItem = document.createElement('div');
        tabItem.className = 'tab-item';

        const tabInfo = document.createElement('div');
        tabInfo.className = 'tab-info';

        // Add favicon
        const favicon = document.createElement('img');
        favicon.className = 'tab-favicon';
        favicon.src = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="%23999" d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/></svg>';
        favicon.onerror = () => {
          favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="%23999" d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/></svg>';
        };

        const tabTitle = document.createElement('span');
        tabTitle.className = 'tab-title';
        tabTitle.textContent = tab.title || 'Untitled';
        tabTitle.title = tab.title; // Tooltip for full title

        tabInfo.appendChild(favicon);
        tabInfo.appendChild(tabTitle);

        const tabActions = document.createElement('div');
        tabActions.className = 'tab-actions';

        const openBtn = document.createElement('button');
        openBtn.innerHTML = '<i class="bi bi-eye"></i>';
        openBtn.className = 'btn-icon btn-success-gradient';
        openBtn.title = 'Switch to this tab';
        openBtn.onclick = async () => {
          try {
            await chrome.tabs.update(tab.id, { active: true });
            await chrome.windows.update(tab.windowId, { focused: true });
            window.close(); // Close popup after switching
          } catch (error) {
            console.error('Error switching to tab:', error);
          }
        };

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="bi bi-x"></i>';
        closeBtn.className = 'btn-icon btn-danger-gradient';
        closeBtn.title = 'Close this tab';
        closeBtn.onclick = async () => {
          try {
            await chrome.tabs.remove(tab.id);
            tabItem.remove();
            
            // Update tab count for this group
            const currentCount = parseInt(groupTitle.querySelector('.tab-count').textContent);
            const newCount = currentCount - 1;
            groupTitle.querySelector('.tab-count').textContent = newCount;
            
            // Update total stats
            const totalTabs = parseInt(totalTabsElement.textContent) - 1;
            totalTabsElement.textContent = totalTabs;
            
            // Remove group if no tabs left
            if (newCount === 0) {
              groupCard.remove();
              const totalGroups = parseInt(totalGroupsElement.textContent) - 1;
              totalGroupsElement.textContent = totalGroups;
              
              // Show empty state if no tabs left
              if (totalTabs === 0) {
                groupsContainer.style.display = 'none';
                emptyState.style.display = 'block';
              }
            }
          } catch (error) {
            console.error('Error closing tab:', error);
          }
        };

        tabActions.appendChild(openBtn);
        tabActions.appendChild(closeBtn);

        tabItem.appendChild(tabInfo);
        tabItem.appendChild(tabActions);
        groupCard.appendChild(tabItem);
      });

      groupsContainer.appendChild(groupCard);
    }
  } catch (error) {
    console.error('Error loading tabs:', error);
    loadingElement.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.innerHTML = `
      <div class="empty-icon">
        <i class="bi bi-exclamation-triangle"></i>
      </div>
      <h5>Error loading tabs</h5>
      <p>Please try refreshing the extension.</p>
    `;
  }

  // Close All Tabs functionality
  document.getElementById('closeAll').addEventListener('click', async () => {
    const totalTabs = parseInt(totalTabsElement.textContent);
    if (totalTabs === 0) return;
    
    if (confirm(`Are you sure you want to close all ${totalTabs} tabs? This action cannot be undone.`)) {
      try {
        const allTabs = await chrome.tabs.query({});
        await chrome.tabs.remove(allTabs.map(tab => tab.id));
        
        // Update UI
        groupsContainer.innerHTML = '';
        groupsContainer.style.display = 'none';
        emptyState.style.display = 'block';
        totalTabsElement.textContent = '0';
        totalGroupsElement.textContent = '0';
      } catch (error) {
        console.error('Error closing all tabs:', error);
      }
    }
  });

  // Refresh functionality
  document.getElementById('refreshGroups').addEventListener('click', () => {
    window.location.reload();
  });
});