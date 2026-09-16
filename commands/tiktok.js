"use strict";

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tt", "tik", "ttdl"],
    version: "2.0.0",
    author: "frnAlt & Floppa Team",
    cooldown: 5,
    role: 0,
    category: "media",
    description: { en: "Download TikTok videos without watermark or extract audio" },
    usage: { en: "{p}tiktok <link> [--audio]" }
  },

  onStart: async function ({ message, args, event, api }) {
    let url = args.find(a => /tiktok\.com/i.test(a));
    const isAudio = args.includes("--audio") || args.includes("-a");

    const reply = event.messageReply || event.repliedMessage;
    if (!url && reply && (reply.body || reply.text)) {
      const text = reply.body || reply.text;
      const m = text.match(/https?:\/\/[^\s]+tiktok\.com[^\s]*/i) || text.match(/https?:\/\/[^\s]+/i);
      if (m) url = m[0];
    }

    if (!url) {
      return message.reply("📱 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n\n📌 Usage: {p}tiktok <tiktok_url> [--audio]\n💡 Example: {p}tiktok https://vt.tiktok.com/xxxx/");
    }

    if (message && typeof message.react === "function") {
      message.react("⏳");
    } else if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("⏳", event.messageID, event.threadID, () => {}, true);
    }

    let tempPath = null;
    try {
      const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, { timeout: 15000 });
      const data = res.data?.data;
      if (!data) throw new Error("Could not parse TikTok video data");

      const downloadUrl = isAudio ? (data.music || data.play) : (data.play || data.wmplay);
      const title = data.title || "TikTok Video";
      const author = data.author?.nickname || "TikTok Creator";

      const ext = isAudio ? "mp3" : "mp4";
      const tempDir = path.join(process.cwd(), "temp");
      await fs.ensureDir(tempDir);
      tempPath = path.join(tempDir, `tiktok_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`);

      const mediaRes = await axios.get(downloadUrl, { responseType: "arraybuffer", timeout: 45000 });
      await fs.writeFile(tempPath, Buffer.from(mediaRes.data));

      if (message && typeof message.react === "function") {
        message.react("✅");
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
    } catch (err) {
      if (tempPath) fs.unlink(tempPath).catch(() => {});
      if (message && typeof message.react === "function") {
        message.react("❌");
      } else if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("❌", event.messageID, event.threadID, () => {}, true);
      }
      return message.reply(`❌ TikTok download failed: ${err.message}`);
    }
  }
};
