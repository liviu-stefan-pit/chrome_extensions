const GroupsStorage = {
  async getAll() {
    const { groups = [] } = await chrome.storage.local.get("groups");
    return groups;
  },
  async save(name, urls) {
    const groups = await this.getAll();
    if (groups.some(g => g.name === name)) throw new Error("Group name already exists.");
    groups.push({ name, urls });
    await chrome.storage.local.set({ groups });
  },
  async delete(name) {
    let groups = await this.getAll();
    groups = groups.filter(g => g.name !== name);
    await chrome.storage.local.set({ groups });
  },
  async rename(oldName, newName) {
    const groups = await this.getAll();
    if (groups.some(g => g.name === newName)) throw new Error("New group name already exists.");
    const group = groups.find(g => g.name === oldName);
    if (!group) throw new Error("Group not found.");
    group.name = newName;
    await chrome.storage.local.set({ groups });
  },
  async restore(name) {
    const group = (await this.getAll()).find(g => g.name === name);
    if (!group) throw new Error("Group not found.");
    group.urls.forEach(url => {
      if (url && url.startsWith("http")) chrome.tabs.create({ url });
    });
  }
};

if (typeof window !== "undefined") window.GroupsStorage = GroupsStorage;
