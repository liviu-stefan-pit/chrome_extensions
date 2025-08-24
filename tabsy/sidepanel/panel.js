// Minimal side panel bootstrap using shared controller.js
(async()=>{const root=document.getElementById('app-root');if(!root)return;if(!window.TabsyUIController){console.error('TabsyUIController script missing');return;}const controller=new window.TabsyUIController(root);window.tabsySidePanel=controller;await controller.init();})();
