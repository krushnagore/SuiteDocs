# SuiteDocs — Definitive SuiteScript 2.1 Developer Platform

[![NetSuite SuiteScript 2.1](https://img.shields.io/badge/NetSuite-SuiteScript%202.1-emerald.svg)](https://docs.oracle.com/)
[![Modules Covered](https://img.shields.io/badge/Modules-55%20Verified-blue.svg)](#modules-catalog)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Author](https://img.shields.io/badge/Architect-Krushna%20Gore-purple.svg)](https://github.com/krushnagore)

**SuiteDocs** is a high-performance, developer-first documentation portal and governance engine covering all **55 official SuiteScript 2.1 modules**. Engineered for NetSuite developers, technical consultants, and solution architects, it provides instant sub-millisecond API discovery, complete parameter definitions, return types, governance unit calculations, and official AMD script samples.

> **Authored & Architected by:** **Krushna Gore**  
> *NetSuite Solution Architect & SuiteCloud Developer*

---

## 🚀 Key Features

* **Complete 55-Module Coverage**: Every single SuiteScript 2.1 module from `N/action` through `N/xml` parsed and cataloged.
* **1,684+ API Methods & Properties**: Detailed signatures, parameter types, optionality flags, return values, and governance consumption.
* **155+ Official Code Samples**: Copy-pasteable SuiteScript 2.1 AMD samples for each method and script type.
* **Interactive Governance Calculator**: Real-time script budget simulator supporting User Events (1,000 units), Client Scripts (1,000 units), Suitelets (1,000 units), RESTlets (5,000 units), Scheduled (10,000 units), and Map/Reduce (10,000 units per stage).
* **Instant Command Palette (`Ctrl + K`)**: Keyboard-driven spotlight search across all modules, methods, properties, and developer tools.
* **Automated Documentation Pipeline**: Scheduled background synchronization that checks Oracle NetSuite documentation updates, compiles structured data, and republishes without downtime.
* **Privileged In-App Admin Modal (`Ctrl + Shift + S`)**: Quick dialog for administrators to inspect sync cadence and change update frequencies.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with Redwood & Dark Slate Palette |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Search Engine** | Client-Side In-Memory Indexer (<1ms search latency) |
| **Pipeline** | Python 3.11 Automated Documentation Scraper & Compiler |
| **CI/CD** | GitHub Actions Cloud Cron (`deploy-and-sync.yml`) |

---

## 📂 Project Structure

```
SuiteDocs/
├── .github/
│   └── workflows/
│       └── deploy-and-sync.yml      # Cloud Cron workflow for automated doc sync & GitHub Pages deployment
├── SuiteDocs Site/                  # Web application source
│   ├── public/
│   │   └── data/
│   │       ├── suite_script_21_complete.json # 982 KB structured database (55 modules, all members, samples)
│   │       └── sync_config.json              # Active update cadence & pipeline configuration
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx           # Global navigation header
│   │   │   ├── Sidebar.tsx          # Filterable category navigation
│   │   │   ├── CommandPalette.tsx   # Ctrl+K spotlight modal
│   │   │   ├── ModuleView.tsx       # Detailed module viewer with syntax & samples
│   │   │   ├── MemberCard.tsx       # Method/Property API card
│   │   │   ├── CodeBlock.tsx        # Syntax-highlighted code block with 1-click copy
│   │   │   ├── GovernanceCalculator.tsx # Live governance budget simulator
│   │   │   └── SyncModal.tsx        # Privileged admin schedule modal (Ctrl+Shift+S)
│   │   ├── views/
│   │   │   ├── HomeView.tsx         # Dashboard featuring quick links, stats, and core APIs
│   │   │   └── GovernanceView.tsx   # Dedicated governance budget hub
│   │   ├── services/
│   │   │   ├── docService.ts        # Module data access layer
│   │   │   └── searchService.ts     # In-memory search & fuzzy indexer
│   │   ├── types/
│   │   │   └── doc.ts               # Complete TypeScript interfaces
│   │   ├── App.tsx                  # Application orchestrator & shortcut router
│   │   └── main.tsx                 # React entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── sync_manager.py                  # Master documentation updater & CLI manager
├── sync_config.json                 # Frequency and schedule configuration
├── setup_scheduler.ps1              # Windows Task Scheduler manager
└── update_frequency.bat             # 1-click batch script for frequency adjustments
```

---

## 💻 Getting Started Locally

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Python**: v3.10 or higher (for documentation synchronization pipeline)

### Installation & Development

1. **Navigate to the site directory:**
   ```powershell
   cd "SuiteDocs Site"
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start the local development server:**
   ```powershell
   npm run dev
   ```
   *Open your browser at `http://localhost:5173/`*

4. **Build production bundle:**
   ```powershell
   npm run build
   ```

5. **Preview production build:**
   ```powershell
   npm run preview
   ```

---

## 🔄 Automated Update Schedule

SuiteDocs documentation is designed to remain continuously synchronized with Oracle's official NetSuite documentation.

### Update Schedule Configurations

You can adjust the frequency at any time using terminal commands or editing `sync_config.json`:

```powershell
# Set update schedule to Daily
.\update_frequency.bat daily

# Set update schedule to Weekly (Default: Every Sunday at 02:00 AM)
.\update_frequency.bat weekly

# Set update schedule to Custom Days (e.g., every 3 days)
.\update_frequency.bat 3

# Trigger an immediate manual sync
.\update_frequency.bat --run-now

# Check current sync status and schedule
.\update_frequency.bat --status
```

### Privileged In-Site Dialog
While on the site, you can view the active schedule and instructions anytime:
* Press **`Ctrl + Shift + S`** anywhere on the page.
* Or press **`Ctrl + K`** (Command Palette) and type `sync`.

---

## 🌐 Deployment

### Option A: GitHub Pages (Recommended)
1. Push the repository to GitHub:
   ```powershell
   git push origin main
   ```
2. Navigate to your repository on GitHub:
   * Go to **Settings** $\to$ **Pages**.
   * Under **Build and deployment** $\to$ **Source**, choose **GitHub Actions**.
3. The `.github/workflows/deploy-and-sync.yml` workflow will automatically build, deploy, and keep the site synchronized on schedule in the cloud.

### Option B: Vercel (Instant)
```powershell
cd "SuiteDocs Site"
npx vercel
```

### Option C: Netlify
```powershell
cd "SuiteDocs Site"
npx netlify deploy --prod --dir=dist
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Ctrl + K`** or **`Cmd + K`** | Open Instant Command Palette / Search |
| **`Ctrl + Shift + S`** | Open Privileged Auto-Sync & Schedule Settings |
| **`Esc`** | Close open modal or search dialog |

---

## 👤 Author & Architecture

**Krushna Gore**  
*NetSuite Solution Architect & SuiteCloud Developer*  
* GitHub: [@krushnagore](https://github.com/krushnagore)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
