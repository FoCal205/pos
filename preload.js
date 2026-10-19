/**
 * ShopDesk POS — Preload Script
 * ──────────────────────────────
 * Exposes a safe `window.shopAPI` bridge from the
 * Electron main process to the renderer (index.html).
 * contextIsolation = true keeps Node.js isolated.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('shopAPI', {

  // ── Data persistence ──────────────────────────────
  loadData:       ()        => ipcRenderer.invoke('load-data'),
  saveData:       (payload) => ipcRenderer.invoke('save-data', payload),
  getDataPath:    ()        => ipcRenderer.invoke('get-data-path'),
  getBackupPath:  ()        => ipcRenderer.invoke('get-backup-path'),

  // ── Backup management ─────────────────────────────
  listBackups:    ()            => ipcRenderer.invoke('list-backups'),
  restoreBackup:  (backupPath)  => ipcRenderer.invoke('restore-backup', backupPath),
  openDataFolder: ()            => ipcRenderer.invoke('open-data-folder'),

  // ── Export / Import ───────────────────────────────
  exportSales:    (sales)   => ipcRenderer.invoke('export-sales', sales),
  exportJSON:     (payload) => ipcRenderer.invoke('export-json', payload),
  importJSON:     ()        => ipcRenderer.invoke('import-json'),

  // ── Printing ──────────────────────────────────────
  printReceipt:   (html)    => ipcRenderer.invoke('print-receipt', html),

});
