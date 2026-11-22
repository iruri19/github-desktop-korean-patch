'use strict';
// Translate final menu labels after IDs/actions have been assigned.
const path = require('node:path');
const fs = require('node:fs');
const { translate } = require('./translate-text.cjs');
function translateLabel(label) {
  if (typeof label !== 'string' || /[가-힣]/.test(label)) return label;
  const key = label.replace(/&/g, '').replace(/…/g, '...');
  let result = translate(key, { ui: true, toolbar: true });
  if (result === key) {
    const match = key.match(/^Open in (.+)$/);
    if (match) result = `${match[1]}에서 열기`;
  }
  if (result === key) return label;
  const access = label.match(/&([^&])/);
  return result + (access ? `(&${access[1].toUpperCase()})` : '');
}
function translateMenu(menu) {
  for (const item of menu.items || []) {
    if (item.label) item.label = translateLabel(item.label);
    if (item.submenu) translateMenu(item.submenu);
  }
  return menu;
}
function install(electron) {
  const { Menu, MenuItem, shell } = electron;
  const build = Menu.buildFromTemplate;
  Menu.buildFromTemplate = function (...args) {
    const menu = translateMenu(build.apply(this, args));
    // The beginner guide belongs only to the application Help menu.
    const help = menu.items.find(item => item.id === 'Help' || /도움말|^&?Help$/.test(item.label || ''));
    if (help && help.submenu && !help.submenu.items.some(item => item.id === 'korean-beginner-guide')) {
      help.submenu.append(new MenuItem({
        id: 'korean-beginner-guide', label: '처음사용자 안내서 (PDF)',
        click: () => {
          const guide = path.resolve(__dirname, '../../처음사용자/GitHub_처음사용자_안내서.pdf');
          if (fs.existsSync(guide)) shell.openPath(guide);
        }
      }));
    }
    return menu;
  };
  const popup = Menu.prototype.popup;
  Menu.prototype.popup = function (...args) {
    translateMenu(this);
    return popup.apply(this, args);
  };
}
module.exports = { install, translateLabel, translateMenu };
