<div align="center">
  <img src="assets/banner.jpg" alt="InstaBOT Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />

  # ⚡ InstaBOT
  *Next-Generation High-Performance Instagram Chatbot Engine*

  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![Repository](https://img.shields.io/badge/GitHub-frnAlt%2FInstaBOT-blue.svg?style=for-the-badge&logo=github)](https://github.com/frnAlt/InstaBOT)
  [![Status](https://img.shields.io/badge/Status-100%25_Verified-success.svg?style=for-the-badge)](https://github.com/frnAlt/InstaBOT)
  [![Commands](https://img.shields.io/badge/Commands-104%2B_Loaded-purple.svg?style=for-the-badge)](#-commands--features)
  [![License](https://img.shields.io/badge/License-MIT-orange.svg?style=for-the-badge)](LICENSE)

  ---
</div>

## 🌟 Overview

**InstaBOT** is a modular, high-performance Instagram Direct Messenger chatbot built with an integrated native **Instagram Chat API (ICA)** engine. Designed for reliability, safety, and extensibility, it features dual command execution paradigms (supporting both GoatBot V2 and standard formats), a 5-tier role hierarchy, anti-ban protections, AI conversational memory, web dashboard, and multimedia processing.

---

## 📸 Interface & Dashboard

<div align="center">
  <h3>🖥️ Real-Time Management & Analytics Web Dashboard</h3>
  <img src="assets/screenshots/dashboard-overview.jpg" alt="InstaBOT Dashboard Overview" width="100%" style="border-radius: 10px; margin-bottom: 20px;" />

  <br/><br/>

  <h3>📱 Instagram Direct Messenger Interactive Commands</h3>
  <img src="assets/screenshots/chat-commands.jpg" alt="InstaBOT Chat Commands Showcase" width="100%" style="border-radius: 10px; margin-bottom: 20px;" />
</div>

---

## 🔥 Key Features

### 🤖 Dual Command & Event Engine
* **Full Event Lifecycle Hooks**: Complete support for `onStart`, `onReply`, `onReaction`, `onChat`, `onEvent`, `onFirstChat`, `onLoad`, and `onReady`.
* **Universal `message` Helper API**: Provides `message.reply`, `message.send`, `message.reaction`, `message.unsend`, `message.err`, and `message.SyntaxError`.
* **Standard & GoatBot Compatibility**: Seamlessly loads both legacy GoatBot V2 commands and modular `run()` commands.

### 🛡️ Native Built-In ICA Engine (`ica/`)
* **Zero External Lock-In**: Native, self-contained Instagram Chat API engine located directly in `ica/`.
* **Adaptive Rate Limiter & Message Queue**: Human-like message queue delays (200–800ms) with automatic retry on transient drops.
* **Circuit Breaker & Anti-Ban**: Header spoofing, stealth mode, and dynamic cooling windows protect against Instagram rate limits.
* **Multi-Format Session Persistence**: Supports Netscape cookie strings, JSON AppState arrays, raw session IDs, and email/password fallback.

### 👑 5-Tier Role & Permission Hierarchy
| Role | Title | Description |
|:---:|:---|:---|
| `0` | **Normal User** | Access to all standard public commands |
| `1` | **Group Admin** | Instagram thread administrators (moderation, settings) |
| `2` | **Bot Admin** | Configured bot administrators (`adminBot`) |
| `3` | **Premium User** | VIP & Premium access tier (`premiumUsers`) |
| `4` | **Developer** | Full access & system commands (`devUsers`) |

### 🧠 Conversational AI & Multimedia
* **Self-Learning Chat Engine**: Automatically learns conversation flows `(Message A → Message B)` directly from chats.
* **AI Suite**: Gemini, GPT, Claude, Nano-Banana Pro (`!nbpro`), MetaAI, Pollinations AI (`!imggen`, `!art`, `!flux`), and more.
* **Media Downloader**: YouTube audio/video (`!sing`, `!video`, `!ytb`), TikTok (`!tiktok`), Pinterest (`!pinterest`), ImgBB (`!imgbb`), Catbox, and Imgur uploaders.
* **Voice Synthesis**: Google TTS voice notes via `!say` with native voice note streaming.

---

## 📁 Project Structure

```text
InstaBOT/
├── ica/                     # Native Instagram Chat API Engine
│   ├── src/
│   │   ├── methods/         # Auth, messaging, media, threads, reactions, users
│   │   ├── mqtt/            # Realtime MQTT listener & connection manager
│   │   └── utils/           # Crypto, cookies, HTTP client, rate limiter
│   └── index.js             # ICA Engine Entry Point
├── bot/                     # Core Bot Controller
│   ├── InstagramBot.js      # Main Lifecycle & API Wrapper
│   ├── autoUptime.js        # Server Keep-Alive Service
│   └── custom.js            # Custom Startup Scripts
├── commands/                # 104+ Modular Command Modules
├── events/                  # Event Handlers (message, reaction, join, leave, ready)
├── config/                  # Configuration & Default Settings
│   ├── default.json         # Config values (prefix, admins, options)
│   └── index.js             # Environment & JSON Merger
├── utils/                   # Shared Utilities
│   ├── database.js          # SQLite & JSON Storage Abstraction
│   ├── messageQueue.js      # Rate Limiting & Queue Manager
│   ├── permissions.js       # 5-Tier Role Resolver
│   ├── moderation.js        # Whitelist & Spam Protection
│   ├── commandLoader.js     # Hot-Reload Command Loader
│   └── eventLoader.js       # Event Dispatcher
├── storage/                 # Data Storage & Logs
├── dashboard/               # Web Management Dashboard
├── account.txt              # Instagram Session Cookies (Keep Private!)
├── index.js                 # Application Entry Point
└── package.json
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
* **Node.js**: `v20.0.0` or higher
* **Git**: Installed on your system

### 2. Clone Repository
```bash
git clone git@github.com:frnAlt/InstaBOT.git
cd InstaBOT
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Instagram Cookies
Export your Instagram session cookies (in **Netscape format** or **JSON format**) and place them into `account.txt` in the root directory:

```text
# Netscape HTTP Cookie File
.instagram.com	TRUE	/	TRUE	1798765432	sessionid	YOUR_SESSION_ID
.instagram.com	TRUE	/	TRUE	1798765432	ds_user_id	YOUR_USER_ID
.instagram.com	TRUE	/	TRUE	1798765432	csrftoken	YOUR_CSRF_TOKEN
```

### 5. Configure
Edit `config/default.json` to set your bot prefix, bot admin IDs, and options:

```jsonc
{
  "prefix": "!",
  "noPrefix": true,
  "adminBot": ["YOUR_INSTAGRAM_USER_ID"],
  "devUsers": ["YOUR_INSTAGRAM_USER_ID"],
  "nickNameBot": "InstaBOT",
  "optionsIca": {
    "stealthMode": true,
    "selfListen": true,
    "listenEvents": true
  }
}
```

### 6. Start the Bot
```bash
npm start
```

---

## 👨‍💻 Developer & Credits

* **Developer / Maintainer**: [Gtajisan](https://github.com/Gtajisan)
* **GitHub Repository**: [frnAlt/InstaBOT](https://github.com/frnAlt/InstaBOT)
* **Engine**: Built-in native **ICA** Engine

---

<div align="center">
  <sub>Made with ❤️ by Gtajisan • Powered by InstaBOT Engine</sub>
</div>
