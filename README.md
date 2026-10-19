# ShopDesk POS
### Complete Retail Management System

---

## 📁 Project Structure

```
ShopDeskPOS/
├── main.js              ← Electron main process (window, file I/O, IPC)
├── preload.js           ← Secure bridge between Electron and the UI
├── package.json         ← Dependencies and build configuration
├── renderer/
│   └── index.html       ← The full application (all UI, logic, styles)
├── test-in-browser.html ← Open this to test without installing anything
└── README.md            ← This file
```

---

## 🚀 Quick Test (No Installation Needed)

Open **`test-in-browser.html`** in **Google Chrome** or **Microsoft Edge**.

> ⚠️ Must use Chrome or Edge — Firefox does not support the Folder Picker API.

- All features work in the browser
- Data is saved to a folder you pick (or browser localStorage as fallback)
- Print uses browser print dialog instead of native printer dialog

---

## 🖥️ Run as Desktop App (Electron)

### Requirements

1. **Node.js v18 or higher**
   - Download: https://nodejs.org
   - After installing, restart your computer

2. **Run Command Prompt as Administrator**
   - Press Windows key → type `cmd` → right-click → "Run as administrator"

### Step-by-Step Setup

```bash
# 1. Navigate to the ShopDeskPOS folder
cd C:\path\to\ShopDeskPOS

# 2. Install dependencies (only needed once)
npm install

# 3. Launch the app
npm start
```

The app will open as a full desktop window — no browser needed.

---

## 📦 Build Windows Installer (.exe)

```bash
npm run build
```

- The installer will be created in the **`dist/`** folder
- File name: `ShopDesk POS Setup X.X.X.exe`
- Double-click to install on any Windows PC
- Creates a Desktop shortcut and Start Menu entry

---

## 🔐 Default Login

| Role   | How to login                  |
|--------|-------------------------------|
| Worker | Type your name → Start Selling |
| Admin  | Password: **`admin123`**      |

> **Change your admin password** immediately after first login:
> Settings → Security → Change Password

---

## 💾 Data Storage

### In Electron (Desktop App)
- Data is automatically saved to your **Windows AppData folder**
- Path: `C:\Users\YourName\AppData\Roaming\shopdesk-pos\shopdesk-data.json`
- **Automatic backups** are kept (last 30 backups retained)
- Go to **Settings → Data Management → Open Data Folder** to view files

### In Browser (Test Mode)
- First run: you'll be asked to pick a folder on your computer
- Data is saved as `shopdesk-data.json` in that folder
- Timestamped backups are also saved there automatically

---

## ✨ Features

### 🔐 Login & Access
- Split-screen login (brand panel + login form)
- Worker types their name to log in
- Admin logs in with password
- Remember Me toggle for both roles
- Session timeout (configurable in Settings)

### 🛒 Point of Sale
- Product grid with search and category filters
- Add to cart, adjust quantities
- Cash, Mobile Money, Card payments
- On-screen receipt + native print
- Customer details (optional — name, phone)
- Workers can add new products on-the-fly (sent to admin for approval)

### 📦 Products
- Full product catalog with image, barcode, stock level
- Low stock alerts with threshold setting
- Admin approves/rejects products submitted by workers
- Admin can edit or remove products

### 👥 Staff Management
- Add/remove workers with role (Cashier, Supervisor, Manager, Stock)
- Per-worker permissions (Sell, Add Products, View Reports, Discount, Manage Staff)
- Optional PIN per worker
- Sales performance table per worker
- Real-time activity log

### 📊 Dashboard
- Today's sales, weekly, monthly, yearly stats
- Sales overview bar chart (last 7 days)
- Payment method breakdown (doughnut chart)
- Top products list
- Worker performance summary
- Recent transactions table

### 📈 Reports & Analytics
- Adjustable period (7 / 30 / 90 / 365 days)
- Sales trend line chart
- Category breakdown pie chart
- Worker performance bar chart
- Top products ranking
- Export to CSV

### ⚙️ Settings (5 Tabs)
| Tab         | What you can change                                      |
|-------------|----------------------------------------------------------|
| Branding    | Shop name, tagline, logo URL, live preview               |
| Business    | Address, phone, email, business hours                    |
| Security    | Admin password, session timeout                          |
| Appearance  | Accent color picker + preset swatches                    |
| Data        | Backup now, export, import, auto-backup schedule, reset  |

### 🏷️ White-Label Ready
- Change shop name → updates everywhere (login panel, sidebar, receipts)
- Custom accent color → updates all buttons, highlights, badges
- All business info shown on login screen and receipts

---

## 🛠️ Troubleshooting

**`npm install` fails**
- Make sure you're running CMD as Administrator
- Check Node.js version: `node --version` (must be v18+)

**App won't open after `npm start`**
- Delete the `node_modules` folder and run `npm install` again

**Data not saving in browser**
- Use Chrome or Edge (not Firefox or Safari)
- Make sure you selected a folder when prompted on first run

**Print not working in Electron**
- Check that a printer is installed and set as default in Windows

---

## 📞 Support

For issues or feedback, contact your developer.

---

*ShopDesk POS v2.0 — Built for local retail shops in Ghana 🇬🇭*
