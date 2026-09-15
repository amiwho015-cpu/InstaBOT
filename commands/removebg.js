"use strict";

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { resolveUserTarget, resolveProfile } = require("../src/utils");

module.exports = {
  config: {
    name: "removebg",
    aliases: ["nobg", "rmbg"],
    version: "2.0.0",
    author: "frnAlt & Floppa Team",
    cooldown: 8,
    role: 0,
    category: "image",
    description: { en: "Remove background from an image or profile picture" },
    usage: { en: "{p}removebg (reply to photo) | {p}removebg -pfp" }
  },

  onStart: async function ({ message, args, event, api }) {
    let imageUrl = null;

    if (args.includes("-pfp") || args.includes("--pfp")) {
      const p = await resolveProfile([event.senderID], event, api);
      imageUrl = p?.profilePicture;
    }

    if (!imageUrl && event.messageReply?.attachments?.length > 0) {
      const a = event.messageReply.attachments[0];
      imageUrl = a.url || a.image;
    }

    if (!imageUrl && event.attachments?.length > 0) {
      imageUrl = event.attachments[0].url || event.attachments[0].image;
    }

    if (!imageUrl && args[0] && /^https?:\/\//i.test(args[0])) {
      imageUrl = args[0];
    }

    if (!imageUrl) {
      return message.reply("🖼️ 𝗥𝗲𝗺𝗼𝘃𝗲 𝗕𝗮𝗰𝗸𝗴𝗿𝗼𝘂𝗻𝗱\n\n📌 Reply to an image with: {p}removebg\nOr use: {p}removebg -pfp");
    }

    if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
    }

    let tempPath = null;
    try {
      const apiUrl = `https://api.remove.bg/v1.0/removebg`; // fallback to free API service
      const res = await axios.get(`https://kaiz-apis.gleeze.com/api/removebg?url=${encodeURIComponent(imageUrl)}`, {
        responseType: "arraybuffer",
        timeout: 30000
      }).catch(async () => {
        return await axios.get(`https://api.siputzx.my.id/api/iloveimg/removebg?url=${encodeURIComponent(imageUrl)}`, {
          responseType: "arraybuffer",
          timeout: 30000
        });
      });

      const tempDir = path.join(process.cwd(), "temp");
      await fs.ensureDir(tempDir);
      tempPath = path.join(tempDir, `nobg_${Date.now()}_${Math.random().toString(36).substring(7)}.png`);
      await fs.writeFile(tempPath, Buffer.from(res.data));

      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("✨", event.messageID, () => {}, true);
      }

      const sent = await message.reply({
        body: "✨ Background removed successfully!",
        attachment: tempPath,
        textFirst: true
      });

      setTimeout(() => {
        if (tempPath) fs.unlink(tempPath).catch(() => {});
      }, 20000);
      return sent;
    } catch (err) {
      if (tempPath) fs.unlink(tempPath).catch(() => {});
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      return message.reply(`❌ Could not remove background: ${err.message}`);
    }
  }
};
