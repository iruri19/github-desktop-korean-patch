'use strict';
// UI-only translation. Never writes to Git, project files, network or form values.
(() => {
  const { translate } = require('./translate-text.cjs');
  const excluded = 'input,textarea,code,script,style,[contenteditable],.CodeMirror,.cm-editor,.monaco-editor,.diff,.diff-view,.diff-table,.commit-summary,.commit-description,.repository-name,.branch-name,.path,.filename';
  const dialogSelector = 'dialog,[role="dialog"],[role="alertdialog"],.dialog-component,.dialog-error,.dialog-content';
  function isExcluded(element) {
    if (element.closest(excluded)) return true;
    // Error dialogs render their human-readable message in a <pre>.
    // Source files/diffs/logs outside dialogs must remain unchanged.
    return !!element.closest('pre') && !element.closest(dialogSelector);
  }
  const originals = new WeakMap();
  function processElement(element) {
    if (!(element instanceof Element)) return;
    if (element.matches('input,textarea')) {
      const placeholder = element.getAttribute('placeholder');
      if (placeholder) {
        const translated = translate(placeholder);
        if (translated !== placeholder) element.setAttribute('placeholder', translated);
      }
      return;
    }
    if (isExcluded(element)) return;
    for (const attr of ['placeholder', 'aria-label', 'title']) {
      const before = element.getAttribute(attr);
      if (before && !(element.matches('input,textarea') && attr !== 'placeholder')) {
        const after = translate(before);
        if (after !== before) element.setAttribute(attr, after);
      }
    }
  }
  function processText(node) {
    const parent = node.parentElement;
    if (!parent || isExcluded(parent)) return;
    if (parent.closest('.commit-button strong,.commit-button-dropdown strong,.ref-component,.account-title,.login')) return;
    // The side list can contain user-created names that happen to be English UI words.
    if (parent.closest('#repository-list,#branch-list,.repository-list-item,.branch-list-item,.commit-list-item,.changed-file')) return;
    const before = node.nodeValue;
    if (!before || !before.trim()) return;
    const previous = originals.get(node);
    if (previous && previous.translated === before) return;
    const after = translate(before, {
      ui: true,
      changes: !!parent.closest('#changes,#changes-list,#changes-list-header,.changes-list,.changes-list-header,.changes-list-container'),
      commit: !!parent.closest('.commit-button,.commit-button-dropdown,#commit-button'),
      toolbar: !!parent.closest('#toolbar,#desktop-app-toolbar,.toolbar,.push-pull-button'),
      tutorial: !!parent.closest('.tutorial-panel-component,#tutorial-welcome,#tutorial-done'),
      dialog: !!parent.closest(dialogSelector),
      preferences: !!parent.closest('#preferences,.preferences-container')
    });
    if (after !== before) {
      originals.set(node, { original: before, translated: after });
      node.nodeValue = after;
    }
  }
  function scan(root) {
    if (root.nodeType === Node.TEXT_NODE) { processText(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root instanceof Element && root.matches('input,textarea')) { processElement(root); return; }
    if (root instanceof Element && isExcluded(root)) return;
    if (root instanceof Element) processElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeType === Node.TEXT_NODE) processText(node); else processElement(node);
    }
  }
  let pending = new Set();
  let scheduled = false;
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'childList') for (const node of record.addedNodes) pending.add(node);
      else pending.add(record.target);
    }
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        const nodes = pending; pending = new Set(); scheduled = false;
        for (const node of nodes) if (node.isConnected) scan(node);
      });
    }
  });
  document.documentElement.lang = 'ko';
  scan(document);
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder','aria-label','title'] });
})();
