<div align="center">

<a href="https://github.com/frnAlt/InstaBOT">
  <img src="assets/banner.svg" alt="InstaBOT banner" width="100%" />
</a>

# ⚡ InstaBOT

A modern Instagram Direct chat bot platform built for high-throughput messaging, media automation, and modular command execution.

[![MIT License](https://img.shields.io/badge/license-MIT-ff4d8d?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-34d399?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-179%20passing-34d399?style=for-the-badge)](test/run.js)
[![Commands](https://img.shields.io/badge/commands-196-8b5cf6?style=for-the-badge)](#-complete-command-catalog)
[![Architecture](https://img.shields.io/badge/transport-dual%20mode-ec4899?style=for-the-badge)](#-architecture)

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-configuration">Configuration</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-testing">Testing</a> •
  <a href="#-security">Security</a>
</p>

</div>

---

## 🌟 Overview

InstaBOT combines a powerful Instagram chat runtime with a modular bot framework for Direct messages, group moderation, media commands, AI integrations, and custom event-driven automation.

It supports two execution modes:

1. Direct native connection to Instagram's realtime chat layer using the built-in `ica/` engine.
2. Remote server mode through `auth.js` and an external `ig-chat-api-server` deployment.

This makes the project flexible for local runs, cloud hosting, and multi-account operational patterns without forcing a single architecture.

### Why InstaBOT?

- Dual transport support for both direct and remote operation
- Rich command system with moderation, economy, AI, media, and utility tools
- Stateful reply and reaction handlers for interactive flows
- Media pipeline for text effects, music stickers, images, video, and canvas output
- Smart health checks and production-friendly process management
- Modular ecosystem designed for custom commands and community-driven scripts

---

## 🏗️ Architecture

InstaBOT is designed around a layered backend runtime:

- Transport layer: native ICA or remote auth bridge
- Runtime layer: event loop, command routing, permission checks, reply handlers
- Services layer: AI providers, media tooling, scheduling, health endpoints
- Data layer: config, session storage, thread/user records, filesystem-based persistence
- Operations layer: health probes, process control, deployment hooks

### Core flow

```text
Instagram / Remote Server
          ↓
      Event Feed
          ↓
    Bot Runtime
   ├─ Permission checks
   ├─ Command registry
   ├─ Event handlers
   ├─ Reply/react listeners
   └─ Media / AI services
          ↓
       Response
```

For a deeper breakdown of the runtime and backend components, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🚀 Quick Start

### 1) Prerequisites

- Node.js 20+ recommended
- A dedicated Instagram account for bot automation
- Valid session cookies from Cookie-Editor

### 2) Install

```bash
git clone https://github.com/frnAlt/InstaBOT.git
cd InstaBOT
npm install
```

### 3) Configure authentication

```bash
cp account.txt.example account.txt
```

Paste your exported cookies into `account.txt` or set environment variables such as `IG_COOKIES` and `IG_API_SERVER`.

For setup instructions and anti-ban guidance, see [INSTAGRAM_SETUP.md](INSTAGRAM_SETUP.md).

### 4) Run the bot

#### Direct standalone mode (default)

```bash
npm start
```

#### Remote server mode

```bash
export IG_API_SERVER="https://your-server.example.com"
export IG_API_TOKEN="your-secret-token"
npm start
```

---

## ⚙️ Configuration

The main configuration is in [config.json](config.json), and environment variables can override it through `.env`.

```jsonc
{
  "botName": "InstaBOT",
  "prefix": "-",
  "language": "en",
  "devUsers": ["36296727311", "49212864825"],
  "defaultOff": false,
  "adminOnly": {
    "enable": false,
    "ignoreCommands": []
  },
  "server": {
    "url": "",
    "token": "",
    "timeout": 60000
  },
  "music": {
    "enable": true,
    "apiUrl": "",
    "apiToken": ""
  }
}
```

### Environment variables

| Variable | Purpose | Default |
| :--- | :--- | :--- |
| `BOT_NAME` | Bot display name | `InstaBOT` |
| `PREFIX` | Trigger prefix | `-` |
| `IG_COOKIES` | Cookie string override | empty |
| `IG_API_SERVER` | Remote transport URL | empty |
| `IG_API_TOKEN` | Remote transport auth token | empty |
| `PORT` | Health/dashboard port | `8080` |
| `INSTABOT_URL` | External media/music API URL | empty |
| `INSTABOT_TOKEN` | External API auth token | empty |

---

## 📁 Project Structure

```text
InstaBOT/
├── assets/                 # branding and screenshots
├── commands/               # bot commands and plugins
├── config/                 # config defaults and loader helpers
├── core/                   # runtime and backend orchestration
├── dashboard/              # dashboard UI and related assets
├── database/               # persistent storage helpers
├── docs/                   # technical documentation
├── events/                 # event handlers
├── func/                   # helpers, utilities, automation modules
├── ica/                    # native ICA client engine
├── logger/                 # logging and diagnostics
├── src/                    # application bootstrap and runtime orchestration
├── storage/                # JSON / DB / logs
├── test/                   # verification suite
├── .env.example            # environment template
├── auth.js                 # remote-server auth bridge
├── config.json             # runtime defaults
├── index.js                # app entry point
├── package.json            # scripts and dependencies
├── README.md               # project documentation
├── LICENSE                 # MIT license
└── INSTAGRAM_SETUP.md      # auth and anti-ban guide
```

---

## 🧩 Complete Command Catalog

InstaBOT includes a broad command system covering moderation, social tools, AI integrations, games, media, and automation.

### Core commands

- `help`, `ping`, `uptime`, `uid`, `info`, `pfp`, `echo`, `effect`, `music`, `sing`
- `ai`, `img`, `joke`, `roll`, `ban`, `admin`, `adduser`, `removeuser`, `whitelist`
- `prefix`, `avatar`, `bio`, `cmd`, `eval`, `shell`

### AI and generation

- `claude`, `gemini`, `metaai`, `dalle3`, `imagen3`, `flux`, `genx`, `veo`, `imggen`

### Media and social tools

- `video`, `tiktok`, `pinterest`, `movies`, `anime`, `manga`, `ytb`, `shazam`, `meme`

### Games and economy

- `bank`, `daily`, `work`, `top`, `spin`, `coinflip`, `slot`, `mines`, `quiz`, `rps`

The full command list is documented in the project README sections and the command registry itself.

---

## 🛠️ Deployment

### PM2

```bash
npm install -g pm2
pm2 start index.js --name "instabot"
pm2 save
pm2 startup
```

### Docker

```bash
docker build -t instabot .
docker run -d -p 8080:8080 --name instabot-app instabot
```

### Health checks

The app exposes lightweight health endpoints for deployment systems:

- `GET /health` → returns bot status and runtime metadata
- `GET /` → dashboard or status page

---

## 🧪 Testing

```bash
npm test
```

The project includes a zero-external-dependency verification runner for command behavior, event handling, and runtime checks.

---

## 🔒 Security

1. Keep `account.txt` and cookies out of version control.
2. Store API tokens in environment variables or secret managers.
3. Limit bot admin access to trusted accounts only.
4. Use a secondary Instagram account for automation.
5. Keep the health endpoint and service exposure limited to trusted deployment networks.

---

## 👨‍💻 Credits

- Developer and lead architect: [frnAlt](https://github.com/frnAlt)
- Original architecture and `ig-chat-api` base: [Saifullah Al Neoaz (lazyneoaz)](https://github.com/lazyneoaz)
- Ecosystem influence: Floppa / GoatBot V2 community and contributors

<div align="center">
  <sub>Built for modular automation, media-rich messaging, and reliable bot runtime operations.</sub>
</div>

---

If you want, I can also turn this README into a more premium GitHub-style landing page with a custom hero, badges, animated sections, and a dedicated docs hub.

"""},{"content":"# InstaBOT Architecture Overview

This project is built as a modular, multi-layer bot runtime for Instagram Direct messaging and automation.

## 1. Runtime layers

### Transport layer

The bot can run in two modes:

- Direct native mode: the built-in `ica/` engine connects directly to Instagram's realtime chat infrastructure.
- Remote bridge mode: `auth.js` forwards calls and events to an external `ig-chat-api-server`.

This keeps the application resilient and flexible for both local and cloud hosting scenarios.

### Runtime orchestration

The main application bootstraps in `index.js` and initializes:

- configuration loader
- logger and telemetry
- bot runtime
- health check server
- process lifecycle hooks

### Event / command engine

The command system, reaction listeners, startup hooks, and custom event handlers are all routed through a unified runtime that:

- validates permissions and roles
- matches commands to handlers
- executes media or AI operations
- responds through Instagram messaging APIs
- tracks state for reply-driven conversations

## 2. Backend responsibilities

### Authentication and session handling

Authentication is split across local cookie handling and transport bridge configuration. The project supports:

- cookie-based direct sessions
- remote token authentication
- session verification and fallback strategies

### Media processing

Media commands rely on a modular pipeline for:

- image generation and overlays
- video or audio handling
- music sticker routing
- canvas output generation
- upload and download helpers

### Data and state

State management uses a combination of:

- filesystem data storage
- thread and user metadata
- runtime config values
- command cooldown tracking
- bot-specific event queues

## 3. Operational concerns

The backend is designed for production-oriented operation with:

- health endpoints
- graceful shutdown hooks
- reconnect logic
- telemetry and memory reporting
- optional dashboard integration

## 4. Recommended mental model

Think of InstaBOT as a layered system:

```text
Instagram / Remote API
      ↓
   Transport
      ↓
   Bot runtime
      ↓
   Commands + Events + Media + AI
      ↓
   Storage + Health + Monitoring
```

This gives the project a clean separation between connection management, runtime logic, and operational tooling.

---

For more details, review:

- `index.js`
- `auth.js`
- `src/`
- `func/`
- `ica/`
- `config/`
"""},{"content":"# InstaBOT Environment Variables

Copy this file to `.env` to customize runtime behavior without editing source files.

## Core bot settings
BOT_NAME=InstaBOT
PREFIX=-
LANGUAGE=en
NODE_ENV=production
LOG_LEVEL=info

## Instagram account settings
# Recommended: use a dedicated secondary Instagram account.
IG_COOKIES=
IG_ADMIN_BOT=36296727311,49212864825

## Remote bridge mode
# Leave blank to run in direct standalone mode.
IG_API_SERVER=
IG_API_TOKEN=
IG_SELF_LISTEN=true

## Health and deployment
PORT=8080

## External APIs and media services
INSTABOT_URL=
INSTABOT_TOKEN=

## Optional advanced settings
DATABASE_PATH=./storage/data/bot.sqlite
SESSION_SECRET=change_this_secret

# End of file
"""}]}  
