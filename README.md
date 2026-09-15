<div align="center">
  <img src="https://raw.githubusercontent.com/frnAlt/InstaBOT/main/assets/banner.jpg" alt="InstaBOT Banner" width="100%" />

  # ⚡ InstaBOT
  **Next-Generation High-Performance Instagram Chatbot Platform**
  *Powered by the Floppa / GoatBot V2 Ecosystem & Native Instagram Chat API (ICA)*

  [![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-brightgreen.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![GitHub Repository](https://img.shields.io/badge/GitHub-frnAlt%2FInstaBOT-blue.svg?style=for-the-badge&logo=github)](https://github.com/frnAlt/InstaBOT)
  [![Build Status](https://img.shields.io/badge/Tests-8%2F8%20Passing%20(100%25)-success.svg?style=for-the-badge)](test/suite.js)
  [![Commands Loaded](https://img.shields.io/badge/Commands-142%20Loaded%20(275%20Aliases)-purple.svg?style=for-the-badge)](#-complete-command-catalog)
  [![ICA Engine](https://img.shields.io/badge/Engine-Native%20ICA-red.svg?style=for-the-badge)](docs/ica.md)
  [![License](https://img.shields.io/badge/License-MIT-orange.svg?style=for-the-badge)](LICENSE)

  <p align="center">
    <a href="#-overview">Overview</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-key-features--highlights">Features</a> •
    <a href="#-permission-hierarchy">Permissions</a> •
    <a href="#-complete-command-catalog-142-commands">Commands</a> •
    <a href="#-quick-start--installation">Installation</a> •
    <a href="#-configuration-reference">Configuration</a> •
    <a href="#-media-engine--video-captions">Media Engine</a> •
    <a href="#-deployment--production">Deployment</a> •
    <a href="#-testing--verification">Testing</a> •
    <a href="#-credits--attribution">Credits</a>
  </p>

  ---
</div>

## 🌟 Overview

**InstaBOT** is an enterprise-grade, highly resilient Instagram Direct chatbot platform. It unites the complete command framework, event handlers, interactive multi-turn conversations (`onReply`, `onReaction`), and modular architecture from **Floppa-Chatbot / GoatBot V2** with an integrated, zero-lock-in **Native Instagram Chat API (ICA)** transport layer.

Unlike legacy bots that attempt to shoehorn Facebook Messenger protocols into Instagram, InstaBOT features a platform-neutral core with a dedicated Instagram adapter. It natively handles direct messaging, group conversations, media attachments, real-time MQTT synchronization, human typing jitter, and Instagram-exclusive power-ups (custom text effects, animated avatar effects, and official music stickers).

---

## 🏗️ System Architecture

```text
                     FLOPPA / GOATBOT V2 CORE
                                |
             +------------------+------------------+
             |                  |                  |
         Commands             Events            Services
       (142 modules)       (7 handlers)      (Domain logic)
             |                  |                  |
             +------------------+------------------+
                                |
                    CENTRAL EVENT DISPATCHER
             (Prefix, Cooldowns, Roles, Anti-Spam)
                                |
                     PLATFORM ADAPTER LAYER
           (Normalizer, Media Pipeline, API Wrapper)
                                |
                     NATIVE INSTAGRAM ICA
                  (Direct MQTT / REST / Iris)
                                |
                        INSTAGRAM DIRECT
```

### Architectural Highlights
1. **Core Runtime (`core/`):** Houses the platform-neutral bot orchestrator, command/event loaders, and the central dispatcher with sliding-window event deduplication, flood protection (`func/spamTracker.js`), and per-command cooldowns (`func/cooldownManager.js`).
2. **Platform Adapter (`platforms/instagram/`):** Normalizes incoming Instagram events into unified Floppa schemas, wraps outgoing APIs with safe fallbacks, and manages message contexts.
3. **Native ICA Subsystem (`ica/`):** Zero-lock-in, locally maintained Instagram Chat API supporting dual-mode operations:
   - **Direct Mode:** Direct Node.js WebSocket Secure (`wss://edge-chat.instagram.com/chat`) connection via FB-MQTT with zlib compression, Iris sync, and tough-cookie persistence.
   - **Remote Mode:** Microservice connection via HTTP POST (`/rpc`) and Server-Sent Events (`/events`).
4. **Media Engine (`platforms/instagram/media/` & `services/media/`):** Automatic detection, streaming, downloading, format conversion, and Instagram Direct video caption separation.
5. **Domain Services (`services/`):** Reusable business logic for users, threads, media, and capability detection.

---

## 🔥 Key Features & Highlights

* 🚀 **Zero External Dependency Lock-In:** Complete native Instagram Chat API engine maintained directly inside the repository (`ica/`).
* 🔄 **Dual Invocation Handlers:** Seamlessly executes GoatBot V2 handlers (`onStart`, `onReply`, `onReaction`, `onChat`, `onLoad`) and legacy format handlers (`run`).
* 💬 **Interactive Multi-Turn Conversations:** Stateful `onReply` and `onReaction` callbacks with 30-minute auto-expiring `TTLMap` memory.
* ✨ **Instagram-Native Power-Ups:** Send animated text effects (Love, fire, gift box, celebrate), avatar stickers, and official Instagram catalogue music audio.
* 🎥 **Smart Media Pipeline:** Automatic video caption separation ensures captions are never discarded by Instagram Direct.
* 🎨 **Canvas Compositing Engine:** 25+ rich canvas graphic generators (`rank`, `pair`, `marry`, `rip`, `jail`, `pfpframe`).
* 🛡️ **Anti-Ban & Stealth Protection:** Randomized human typing jitter (40–200ms), modern browser User-Agents, and flood-protection token buckets.
* 📊 **Built-In Dashboard & Health Server:** Zero-dependency HTTP server (`/`, `/health`, `/ping`) on port `3000` for 24/7 cloud health checks.
* 🧪 **Automated Test Suite:** Complete 8-suite test runner (`npm test`) validating permissions, loaders, normalizers, and media pipelines.

---

## 👑 Permission Hierarchy

InstaBOT enforces a strict 4-tier role hierarchy across all commands and interactive reply events:

| Role Level | Role Title | Description & Permissions | Example Commands |
| :---: | :--- | :--- | :--- |
| `0` | **Normal User** | Public utilities, AI chats, games, canvas graphics, and info commands | `!help`, `!ping`, `!ai`, `!sing`, `!work` |
| `1` | **Thread Admin** | Group moderation, participant management, thread prefixes and settings | `!kick`, `!warn`, `!filter`, `!manage` |
| `2` | **Bot Admin** | Configured bot administrators in `config.adminBot` | `!ban`, `!unban`, `!spamban`, `!whitelist` |
| `3` | **Bot Owner** | System administrators in `config.devUsers` with shell/code execution access | `!eval`, `!shell`, `!restart`, `!cmd` |

---

## 📚 Complete Command Catalog (142 Commands)

<details>
<summary><b>🤖 Artificial Intelligence & Generative Models (16 Commands)</b></summary>
<br/>

| Command | Aliases | Description | Usage |
| :--- | :--- | :--- | :--- |
| `ai` | `gpt`, `ask` | Chat with conversational OpenAI GPT models | `!ai <prompt>` |
| `claude` | `cld` | Multi-modal reasoning via Anthropic Claude 3 | `!claude <question>` |
| `gemini` | `bard` | Query Google Gemini conversational models | `!gemini <prompt>` |
| `metaai` | `meta`, `llama` | Chat with Meta LLaMA conversational AI | `!metaai <prompt>` |
| `nbpro` | `nb`, `nanobanana` | High-fidelity image synthesis via Nano-Banana Pro | `!nbpro <prompt>` |
| `flux` | `flux2`, `flux3` | Generate photorealistic art with Flux | `!flux <prompt>` |
| `fluxdev` | `fluxv` | FluxDev photo-realistic generator | `!fluxdev <prompt>` |
| `imagen3` | `imagen4` | Google Imagen text-to-image generator | `!imagen3 <prompt>` |
| `dalle3` | `dalle` | OpenAI DALL-E 3 image generation | `!dalle3 <prompt>` |
| `genx` | `art`, `creart` | Multi-engine artistic image generation | `!genx <prompt>` |
| `nijix` | `niji` | Anime-style aesthetic image generator | `!nijix <prompt> --ar 16:9` |
| `veo` | `txt2video` | AI Text-to-Video generation pipeline | `!veo <prompt>` |
| `imggen` | `img` | Fast multi-model AI image creator | `!imggen <prompt>` |
| `aiphoto` | `photoai` | Enhance and synthesize realistic portraits | `!aiphoto <prompt>` |
| `removebg` | `nobg`, `rbg` | Background removal with transparent PNG output | `!removebg (reply/url)` |
| `autotalk` | `bot` | Context-aware AI auto-responder | Auto-triggered |

</details>

<details>
<summary><b>🎬 Media, Video, Music & Downloaders (23 Commands)</b></summary>
<br/>

| Command | Aliases | Description | Usage |
| :--- | :--- | :--- | :--- |
| `sing` | `song`, `play` | Search and download YouTube audio tracks as MP3 | `!sing <song name>` |
| `music` | `stickermusic`, `igmusic` | Search and send official Instagram Music stickers | `!music <song title>` |
| `video` | `ytv`, `ytvideo` | Search and stream high-quality YouTube video | `!video <video title>` |
| `tiktok` | `tt` | Download TikTok video clips without watermark | `!tiktok <query>` |
| `pinterest` | `pin` | Search and fetch high-resolution Pinterest pins | `!pinterest <search>` |
| `movies` | `imdb`, `film` | Search movie & TV details with posters via OMDb | `!movies <title>` |
| `anime` | `ani`, `mal` | Query anime scores, descriptions, and art | `!anime <anime>` |
| `manga` | `manhwa` | Search manga details and chapter listings | `!manga <manga>` |
| `alldl` | `dl` | Universal video downloader across social media | `!alldl <url>` |
| `ytb` | `youtube` | Direct YouTube downloader with resolution picker | `!ytb <url>` |
| `anisearch` | `animeedit` | Search and download anime AMVs and edits | `!anisearch <anime>` |
| `shazam` | `findsong` | Identify songs from attached audio/video clips | `!shazam (reply)` |
| `emojimix` | `mixemoji` | Google Emoji Kitchen composite graphic generator | `!emojimix 😭 🤣` |
| `meme` | `dankmeme` | Fetch random community memes | `!meme` |
| `imgbb` | `upload` | Upload images directly to ImgBB cloud storage | `!imgbb (reply)` |
| `imgur` | `imgurl` | Upload media to Imgur storage | `!imgur (reply)` |
| `catbox` | `cb` | Upload files to Catbox storage | `!catbox (reply)` |
| `say` | `tts`, `speak` | Text-to-speech voice notes for Instagram Direct | `!say <text>` |
| `pfp` | `avatar` | Fetch high-definition profile avatar of any user | `!pfp <username>` |
| `pfpframe` | `frame` | Generate glowing neon/gold framed avatar cards | `!pfpframe @user` |
| `blur` | `filter` | Apply image filters, blur, and transformations | `!blur (reply)` |
| `effect` | `fx`, `texteffect` | Send text with animated Instagram effects | `!effect love <text>` |
| `avatarfx` | `avatarreaction` | Trigger animated avatar reactions in chat | `!avatarfx <style>` |

</details>

<details>
<summary><b>🎲 Economy, Games & Entertainment (32 Commands)</b></summary>
<br/>

| Command | Aliases | Description | Usage |
| :--- | :--- | :--- | :--- |
| `bank` | `balance`, `bal` | View coins balance and bank deposits | `!bank` |
| `daily` | `claim` | Claim daily economy rewards | `!daily` |
| `economy` | `eco`, `pay` | Transfer currency and check personal wealth | `!economy pay @user <amt>` |
| `work` | `job` | Work various hourly jobs to earn coins | `!work` |
| `top` | `leaderboard` | View top richest users in economy ranking | `!top` |
| `spin` | `wheel` | Spin the lucky fortune wheel for prizes | `!spin <bet>` |
| `roll` | `gamble` | Roll dice for 2x to 5x jackpot payouts | `!roll <bet>` |
| `coinflip` | `cf`, `flip` | Double-or-nothing coin toss | `!coinflip <heads\|tails> <amt>` |
| `slot` | `slots` | Spin the classic casino slot machine | `!slot <bet>` |
| `mines` | `minesweeper` | 5x5 Minefield cashout game | `!mines <bet>` |
| `richroll` | `rr` | High-stakes fortune roll with 5x multiplier | `!richroll <bet>` |
| `wordgame` | `scramble` | Unscramble the hidden word for coin rewards | `!wordgame` |
| `mathquiz` | `math` | Speed mental arithmetic challenge | `!mathquiz [diff]` |
| `guessnumber` | `guessnum` | Secret number guessing game (1-100) | `!guessnumber` |
| `quiz` | `trivia` | Multi-category interactive trivia challenge | `!quiz` |
| `marry` | `wedding` | Propose, marry, and issue marriage certificates | `!marry @user` |
| `hug` | `cuddle` | Dual PFP canvas cuddle graphic | `!hug @user` |
| `kiss` | `smooch` | Romantic canvas composite kiss image | `!kiss @user` |
| `slap` | `hit` | Slap targeted user with canvas graphic | `!slap @user` |
| `ship` | `pair`, `couple` | Calculate love compatibility and composite card | `!ship @user` |
| `jail` | `wanted` | Generate Wanted/Jail bounty posters | `!jail @user` |
| `rip` | `tomb` | Generate gravestone tribute memes | `!rip @user` |
| `gay` | `howgay` | Dual-avatar rainbow compatibility card | `!gay @user` |
| `dice` | `d` | Roll virtual polyhedral dice | `!dice` |
| `rps` | `rockpaperscissors` | Play Rock-Paper-Scissors against bot | `!rps <choice>` |
| `dhbc` | `wordquiz` | Guess-the-word song puzzle | `!dhbc` |
| `bby` | `simi` | Interactive conversational bot | `!bby <msg>` |
| `joke` | `humor` | Tell random jokes | `!joke` |
| `quote` | `q` | Inspirational quotes & canvas quote cards | `!quote` |
| `48law` | `lawsofpower` | 48 Laws of Power wisdom | `!48law [1-48]` |
| `choose` | `pick` | Randomly pick between multiple options | `!choose opt1 \| opt2` |
| `dih` | `challenge` | Interactive trivia challenges | `!dih` |

</details>

<details>
<summary><b>🛡️ Moderation, Group & Permission Management (18 Commands)</b></summary>
<br/>

| Command | Aliases | Description | Role Req |
| :--- | :--- | :--- | :---: |
| `kick` | `remove` | Kick participant from group thread | `1` (Admin) |
| `adduser` | `add` | Add user to Instagram group by User ID | `1` (Admin) |
| `warn` | `warning` | Issue warning strikes to misbehaving members | `1` (Admin) |
| `ban` | `unban` | Ban/unban users from bot access globally | `2` (Bot Admin) |
| `spamban` | `antispam` | View and manage users banned by spam flood filter | `2` (Bot Admin) |
| `whitelist` | `wl` | Toggle whitelist mode for threads and users | `2` (Bot Admin) |
| `approve` | `accept` | Approve pending Instagram message requests | `2` (Bot Admin) |
| `bot` | `botmode` | Toggle bot ON/OFF or Admin-Only mode in thread | `1` (Admin) |
| `thread` | `group` | Manage thread title, photo, and permissions | `1` (Admin) |
| `unsend` | `delete` | Unsend bot messages | `0` (User) |
| `unsendall` | `purge` | Unsend all bot messages in current thread | `2` (Bot Admin) |
| `rules` | `rule` | Display group rules | `0` (User) |
| `busy` | `afk` | Set automatic AFK status when away | `0` (User) |
| `filter` | `badwords` | Configure thread word filter blacklist | `1` (Admin) |
| `admin` | `admins` | List and manage bot administrators | `2` (Bot Admin) |
| `manage` | `managebot` | Thread permissions and command locks | `1` (Admin) |
| `selflisten` | `self` | Toggle bot self-listening capability | `3` (Owner) |
| `theme` | `threadtheme` | Friendly notice: Instagram Direct handles themes in-app | `0` (User) |

</details>

<details>
<summary><b>🛠️ System Diagnostics, Utilities & Developer Suite (23 Commands)</b></summary>
<br/>

| Command | Aliases | Description | Usage |
| :--- | :--- | :--- | :--- |
| `help` | `menu`, `commands`, `h` | Interactive paginated command menu with `onReply` manual inspection | `!help [cmd]` |
| `uptime` | `upt` | Live uptime, system load, RAM, and connection telemetry | `!uptime` |
| `perf` | `benchmark` | System performance benchmark and event loop latency | `!perf` |
| `info` | `about` | Bot information, Node version, authors, and license | `!info` |
| `safeguard` | `health` | System health, RAM allocation, and security telemetry | `!safeguard` |
| `stats` | `statistics` | Command invocation statistics and user ranking | `!stats` |
| `ping` | `latency` | Measure bot roundtrip response time | `!ping` |
| `github` | `gh`, `git` | Query GitHub users and repository statistics | `!github <user\|repo>` |
| `screenshot` | `ss`, `webshot` | Capture full rendered snapshots of any web URL | `!screenshot <url>` |
| `moon` | `moonphase` | High-res lunar phase calendar for any date | `!moon [date]` |
| `tinyurl` | `shorturl` | Shorten links using TinyURL / is.gd APIs | `!tinyurl <url>` |
| `quran` | `surah`, `ayah` | Read Holy Quran verses with Arabic and translation | `!quran <s:a>` |
| `fancy` | `font`, `fonts` | Format text into 30+ stylized Unicode fonts | `!fancy <text>` |
| `uid` | `id` | Get Instagram User ID of sender or target | `!uid [@user]` |
| `userinfo` | `whois` | Comprehensive Instagram profile inspector | `!userinfo <user>` |
| `weather` | `forecast` | Live global weather conditions and forecasts | `!weather <city>` |
| `translate` | `trans` | Translate text into any language | `!translate <lang> <text>` |
| `time` | `clock` | Display world clock and timezone information | `!time [zone]` |
| `calc` | `calculate` | Evaluate complex mathematical expressions | `!calc <expr>` |
| `eval` | `ev` | Evaluate JavaScript code in bot runtime (Owner only) | `!eval <code>` |
| `shell` | `sh`, `exec` | Execute shell commands on host system (Owner only) | `!shell <cmd>` |
| `restart` | `reboot` | Safely restart bot process (Owner only) | `!restart` |
| `cmd` | `command` | Reload or load command modules on the fly (Owner only) | `!cmd load <name>` |

</details>

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
* **Node.js:** `v20.0.0` or higher ([Download](https://nodejs.org/))
* **Git:** Installed on host system
* **Instagram Account:** Cookies exported from a browser (or username/password)

### 2. Clone Repository
```bash
git clone git@github.com:frnAlt/InstaBOT.git
cd InstaBOT
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Provide Instagram Credentials
Paste your exported cookies into `account.txt` in the root folder (supports Netscape format, JSON array, tough-cookie trees, or raw cookie strings):

```text
# Netscape HTTP Cookie File
.instagram.com	TRUE	/	TRUE	1798765432	sessionid	YOUR_SESSION_ID
.instagram.com	TRUE	/	TRUE	1798765432	ds_user_id	YOUR_USER_ID
.instagram.com	TRUE	/	TRUE	1798765432	csrftoken	YOUR_CSRF_TOKEN
```

Alternatively, configure `ACCOUNT_COOKIE` or `ACCOUNT_EMAIL` & `ACCOUNT_PASSWORD` in your `.env` file.

### 5. Start the Bot
```bash
npm start
```

---

## ⚙️ Configuration Reference

### Default Settings (`config/default.json`)
```jsonc
{
  "prefix": "!",
  "noPrefix": true,
  "adminBot": ["YOUR_INSTAGRAM_USER_ID"],
  "devUsers": ["YOUR_INSTAGRAM_USER_ID"],
  "nickNameBot": "InstaBOT",
  "language": "en",
  "optionsIca": {
    "stealthMode": true,
    "selfListen": true,
    "listenEvents": true
  }
}
```

### Environment Variables (`.env`)
| Variable | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `ACCOUNT_COOKIE` | String | `""` | Raw session cookie string |
| `ACCOUNT_EMAIL` | String | `""` | Fallback login email or username |
| `ACCOUNT_PASSWORD` | String | `""` | Fallback login password |
| `PREFIX` | String | `!` | Default command prefix |
| `PORT` | Number | `3000` | HTTP health check server port |
| `IG_API_SERVER` | String | `""` | Optional remote RPC server URL |
| `IG_API_TOKEN` | String | `""` | Optional remote RPC authentication token |

---

## 🎥 Media Engine & Video Captions

### The Instagram Direct Limitation
When broadcasting video or voice note attachments to Instagram Direct, Instagram's API silently discards any text caption included in the multipart payload.

### The InstaBOT Solution
InstaBOT's media pipeline (`platforms/instagram/media/handler.js`) detects if an outgoing form contains both a text body and video/voice media:
1. It sends the text caption as a preamble reply to preserve context.
2. It downloads, validates, and streams the video/audio.
3. It cleans up temporary files immediately after completion.

---

## 🚢 Deployment & Production

### Running with PM2 (Recommended for VPS)
```bash
npm install -g pm2
pm2 start index.js --name "instabot"
pm2 save
pm2 startup
```

### Running with Docker
```bash
docker build -t instabot .
docker run -d -p 3000:3000 --name instabot-app instabot
```

### Health Check & Status Endpoints
InstaBOT runs a lightweight HTTP server on port `3000`:
* `GET /` — Real-time browser dashboard displaying bot uptime, memory usage, command metrics, and active connection status.
* `GET /health` — JSON response `{ status: "ok", uptime, botUserID }` for cloud health probes (Render, Railway, Fly.io, AWS ECS).
* `GET /ping` — Fast `200 OK` ping endpoint.

---

## 🧪 Testing & Verification

InstaBOT includes an automated 8-suite test runner covering all core subsystems, permissions, loaders, dispatcher pipelines, normalizers, media handlers, and tough-cookie session parsers:

```bash
npm test
```

```text
╔═══════════════════════════════════════════════════════════╗
║        InstaBOT Complete Verification Test Suite          ║
╚═══════════════════════════════════════════════════════════╝

  ▶ Permissions Hierarchy (User, Thread Admin, Bot Admin, Owner) ... ✔ PASS
  ▶ CommandLoader & EventLoader Discovery .......................... ✔ PASS
  ▶ Event Normalizer (Raw MQTT -> Floppa Unified Event) ............ ✔ PASS
  ▶ Media Handler Caption Separation for Instagram Video Direct .... ✔ PASS
  ▶ MessageContext Helpers & Direct Instagram Power-ups ............ ✔ PASS
  ▶ Dispatcher onStart & Interactive onReply Handling .............. ✔ PASS
  ▶ Graceful Fallback on Facebook-only features (e.g. !theme) ...... ✔ PASS
  ▶ Tough-Cookie Deserialization & Protocol Compatibility .......... ✔ PASS

───────────────────────────────────────────────────────────
Results: 8 passed, 0 failed.
───────────────────────────────────────────────────────────
```

---

## 🔒 Security & Best Practices

1. **Keep `account.txt` Secret:** Never commit session cookies or passwords. The `.gitignore` file is preconfigured to ignore `account.txt`, `session.json`, and `.env`.
2. **Rate-Limiting & Jitter:** InstaBOT includes adaptive cooldowns and human typing delays (40–200ms) by default to prevent spam triggers.
3. **Role Guards:** Restrict sensitive commands like `!eval` and `!shell` by ensuring your Instagram ID is configured in `devUsers`.

---

## 👨‍💻 Credits & Attribution

* **Core Maintainers & Architects:**
  - [**Gtajisan**](https://github.com/Gtajisan)
  - [**frnAlt**](https://github.com/frnAlt)
* **Architecture Inspiration:**
  - [**Floppa-Chatbot / GoatBot V2**](https://github.com/frnAlt/Floppa-Chatbot)
* **Instagram Protocol & ICA Infrastructure:**
  - [**Saifullah Al Neoaz (lazyneoaz)**](https://github.com/lazyneoaz/Insta-Bot)
* **License:** [MIT License](LICENSE)

---

<div align="center">
  <sub>Crafted with ❤️ by <b>Gtajisan && frnAlt</b> • Powered by the <b>InstaBOT Next-Gen Engine</b></sub><br/>
  <sub>⭐ If you find this project useful, consider giving it a star on GitHub! ⭐</sub>
</div>
