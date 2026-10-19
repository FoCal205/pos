/**
 * ShopDesk POS — Electron Main Process
 * ─────────────────────────────────────
 * Handles: window creation, IPC data persistence,
 * file-based storage, printing, CSV export,
 * backup management, and auto-updates.
 */

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path  = require('path');
const fs    = require('fs');

// ── Paths ─────────────────────────────────────────────────────────────────────
const USER_DATA   = app.getPath('userData');
const DATA_FILE   = path.join(USER_DATA, 'shopdesk-data.json');
const BACKUP_DIR  = path.join(USER_DATA, 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// ── Default data ──────────────────────────────────────────────────────────────
const DEFAULT_DATA = {
  shopName: 'ShopDesk',
  tagline: 'Complete Retail Management System',
  address: '', phone: '', email: '', hours: '',
  logoUrl: '', accentColor: '#1B6B3A',
  adminPassword: 'admin123',
  sessionTimeout: 0,
  workers: [
    { id: 1, name: 'Admin', role: 'admin', pin: '', permissions: { sell: true, addprod: true, reports: true, discount: true, manageStaff: true } },
    { id: 2, name: 'Ama Owusu', role: 'cashier', pin: '1234', permissions: { sell: true, addprod: false, reports: false, discount: false, manageStaff: false } },
    { id: 3, name: 'Kofi Mensah', role: 'supervisor', pin: '5678', permissions: { sell: true, addprod: true, reports: true, discount: true, manageStaff: false } }
  ],
  products: [],
  pendingProducts: [],
  customers: [],
  sales: [],
  activityLog: []
};

// ── Data helpers ──────────────────────────────────────────────────────────────
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('[ShopDesk] Failed to load data:', e.message);
  }
  // First run — write defaults and return them
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf8');
  return DEFAULT_DATA;
}

function saveData(payload) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
    createBackup(payload);
    return { ok: true };
  } catch (e) {
    console.error('[ShopDesk] Save failed:', e.message);
    return { ok: false, error: e.message };
  }
}

function createBackup(payload) {
  try {
    const ts   = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const file = path.join(BACKUP_DIR, `backup-${ts}.json`);
    fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf8');

    // Keep only the latest 30 backups
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort();
    if (backups.length > 30) {
      backups.slice(0, backups.length - 30).forEach(f =>
        fs.unlinkSync(path.join(BACKUP_DIR, f))
      );
    }
  } catch (e) {
    console.warn('[ShopDesk] Backup failed:', e.message);
  }
}

// ── Window ────────────────────────────────────────────────────────────────────
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width:       1280,
    height:      820,
    minWidth:    1024,
    minHeight:   680,
    title:       'ShopDesk POS',
    backgroundColor: '#F5F5F0',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          false
    },
    // Uncomment below to use a custom icon once you add assets/icon.png
    // icon: path.join(__dirname, 'assets', 'icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Remove default menu bar (looks cleaner for a POS app)
  mainWindow.setMenuBarVisibility(false);

  // Open DevTools only in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ── IPC: Data ─────────────────────────────────────────────────────────────────
ipcMain.handle('load-data',    ()          => loadData());
ipcMain.handle('save-data',    (_, payload)=> saveData(payload));
ipcMain.handle('get-data-path',()          => DATA_FILE);
ipcMain.handle('get-backup-path', ()       => BACKUP_DIR);

// ── IPC: Backup management ────────────────────────────────────────────────────
ipcMain.handle('list-backups', () => {
  try {
    return fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, 20)
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        date: fs.statSync(path.join(BACKUP_DIR, f)).mtime.toISOString()
      }));
  } catch { return []; }
});

ipcMain.handle('restore-backup', (_, backupPath) => {
  try {
    const raw = fs.readFileSync(backupPath, 'utf8');
    const payload = JSON.parse(raw);
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
    return { ok: true, data: payload };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('open-data-folder', () => {
  shell.openPath(USER_DATA);
  return true;
});

// ── IPC: Export ───────────────────────────────────────────────────────────────
ipcMain.handle('export-sales', async (_, sales) => {
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title:       'Export Sales Report',
    defaultPath: `shopdesk-sales-${new Date().toISOString().slice(0, 10)}.csv`,
    filters:     [{ name: 'CSV Files', extensions: ['csv'] }]
  });
  if (canceled || !filePath) return { ok: false };

  try {
    const header = 'Date,Transaction ID,Worker,Items,Quantity,Unit Price,Total,Payment\n';
    const rows   = [];
    sales.forEach(s => {
      (s.items || []).forEach(item => {
        rows.push(
          `${new Date(s.date).toLocaleDateString()},` +
          `${s.transactionId || s.id},` +
          `${s.worker},` +
          `${item.name},` +
          `${item.qty},` +
          `${item.price},` +
          `${(item.qty * item.price).toFixed(2)},` +
          `${s.payment}`
        );
      });
    });
    fs.writeFileSync(filePath, header + rows.join('\n'), 'utf8');
    return { ok: true, path: filePath };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('export-json', async (_, payload) => {
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title:       'Export Full Backup',
    defaultPath: `shopdesk-backup-${new Date().toISOString().slice(0, 10)}.json`,
    filters:     [{ name: 'JSON Backup', extensions: ['json'] }]
  });
  if (canceled || !filePath) return { ok: false };
  try {
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('import-json', async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
    title:       'Import Backup',
    filters:     [{ name: 'JSON Backup', extensions: ['json'] }],
    properties:  ['openFile']
  });
  if (canceled || !filePaths.length) return { ok: false };
  try {
    const raw     = fs.readFileSync(filePaths[0], 'utf8');
    const payload = JSON.parse(raw);
    saveData(payload);
    return { ok: true, data: payload };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// ── IPC: Printing ─────────────────────────────────────────────────────────────
ipcMain.handle('print-receipt', async (_, html) => {
  const win = new BrowserWindow({
    width: 420, height: 640,
    show: false,
    webPreferences: { contextIsolation: true }
  });

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

  return new Promise(resolve => {
    win.webContents.print(
      { silent: false, printBackground: true, margins: { marginType: 'printableArea' } },
      (success, err) => {
        win.close();
        resolve({ ok: success, error: err });
      }
    );
  });
});
