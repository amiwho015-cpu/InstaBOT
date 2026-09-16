"use strict";

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const MAX_BYTES = Math.max(256 * 1024, Number(process.env.IG_MAX_MEDIA_BYTES) || 25 * 1024 * 1024);
const MAX_ATTEMPTS = 3;

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tt", "tik", "ttdl"],
    version: "2.5.0",
    author: "frnAlt & Floppa Team",
    cooldown: 5,
    role: 0,
    category: "media",
    description: { en: "Download TikTok videos without watermark, search TikTok, or extract audio" },
    usage: { en: "{p}tiktok <link or search term> [--audio]" }
  },

  onStart: async function ({ message, args, event, api }) {
    const isAudio = args.some(a => ["--audio", "-a", "--sound", "-s", "--music", "-m"].includes(String(a).toLowerCase()));
    const cleanArgs = args.filter(a => !["--audio", "-a", "--sound", "-s", "--music", "-m"].includes(String(a).toLowerCase()));

    let input = cleanArgs.join(" ").trim();
    const reply = event.messageReply || event.repliedMessage;

    if (!input && reply && (reply.body || reply.text)) {
      const text = reply.body || reply.text;
      const m = text.match(/https?:\/\/[^\s]+tiktok\.com[^\s]*/i) || text.match(/https?:\/\/[^\s]+/i);
      input = m ? m[0] : text.trim();
    }

    if (!input) {
      return message.reply(
        "📱 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿 & 𝗦𝗲𝗮𝗿𝗰𝗵\n\n" +
        "📌 Usage:\n" +
        "• Download link: {p}tiktok <link> [--audio]\n" +
        "• Search video: {p}tiktok <search term> [--audio]\n\n" +
        "💡 Examples:\n" +
        "• {p}tiktok https://vt.tiktok.com/xxxx/\n" +
        "• {p}tiktok funny cat\n" +
        "• {p}tiktok phonk edit --audio"
      );
    }

    if (message && typeof message.react === "function") {
      message.react("⏳").catch(() => {});
    } else if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("⏳", event.messageID, event.threadID, () => {}, true);
    }

    let candidates = [];
    const isDirectUrl = /^https?:\/\/[^\s]+/i.test(input);

    if (isDirectUrl) {
      candidates.push({ url: input, title: "TikTok Video", author: "TikTok Creator" });
    } else {
      // Search query using tik-sr
      try {
        const srRes = await axios.get(`https://alldl.neokex.xyz/api/tik-sr?q=${encodeURIComponent(input)}`, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
          timeout: 15000
        });
        const results = srRes.data?.results || [];
        if (!results.length) {
          throw new Error(`No TikTok videos found for "${input}".`);
        }
        for (const item of results.slice(0, 5)) {
          if (item && item.url) {
            candidates.push({
              url: item.url,
              title: item.title || item.description || "TikTok Video",
              author: item.author?.nickname || item.author?.unique_id || "TikTok Creator"
            });
          }
        }
      } catch (srErr) {
        if (message && typeof message.react === "function") message.react("❌").catch(() => {});
        return message.reply(`❌ TikTok search error: ${srErr.message}`);
      }
    }

    if (!candidates.length) {
      if (message && typeof message.react === "function") message.react("❌").catch(() => {});
      return message.reply(`❌ Could not find any videos for: ${input}`);
    }

    let lastError = null;
    let tempPath = null;

    for (const candidate of candidates.slice(0, MAX_ATTEMPTS)) {
      try {
        // 1. Resolve media URL via TikWM API
        const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(candidate.url)}`, {
          timeout: 18000
        });
        const data = res.data?.data;
        if (!data) throw new Error("Could not parse TikTok video data from TikWM");

        const downloadUrl = isAudio ? (data.music || data.play) : (data.play || data.wmplay);
        if (!downloadUrl) throw new Error("No download URL returned for this video");

        const title = data.title || candidate.title || "TikTok Video";
        const author = data.author?.nickname || candidate.author || "TikTok Creator";

        const ext = isAudio ? "mp3" : "mp4";
        const tempDir = path.join(process.cwd(), "temp");
        await fs.ensureDir(tempDir);
        tempPath = path.join(tempDir, `tiktok_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`);

        const mediaRes = await axios.get(downloadUrl, {
          responseType: "arraybuffer",
          timeout: 45000,
          maxContentLength: MAX_BYTES,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://www.tiktok.com/"
          }
        });

        const buf = Buffer.from(mediaRes.data);
        if (buf.length > MAX_BYTES) {
          throw new Error(`Media is ${Math.round(buf.length / (1024 * 1024))} MB, exceeding send limit.`);
        }
        await fs.writeFile(tempPath, buf);

        if (message && typeof message.react === "function") {
          message.react("✅").catch(() => {});
        } else if (api && typeof api.setMessageReaction === "function") {
          api.setMessageReaction("✅", event.messageID, event.threadID, () => {}, true);
        }

        const caption = `📱 𝗧𝗶𝗸𝗧𝗼𝗸 [${isAudio ? "AUDIO" : "VIDEO"}]\n👤 ${author}\n📝 ${title.slice(0, 100)}`;
        const sent = await message.reply({
          body: caption,
          attachment: { path: tempPath, type: isAudio ? "audio" : "video" },
          textFirst: true
        });

        setTimeout(() => {
          if (tempPath) fs.unlink(tempPath).catch(() => {});
        }, 30000);

        return sent;
      } catch (attemptErr) {
        lastError = attemptErr;
        if (tempPath) {
          fs.unlink(tempPath).catch(() => {});
          tempPath = null;
        }
      }
    }

    // All attempts failed
    if (message && typeof message.react === "function") {
      message.react("❌").catch(() => {});
    } else if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("❌", event.messageID, event.threadID, () => {}, true);
    }

    return message.reply(`❌ TikTok failed: ${lastError ? lastError.message : "Unknown error"}`);
  }
};
