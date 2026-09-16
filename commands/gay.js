"use strict";

const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { resolveUserTarget, resolveProfile, extractImageUrl } = require("../src/utils");

module.exports = {
  config: {
    name: "gay",
    aliases: ["pride", "rainbow"],
    version: "2.5.0",
    author: "frnAlt & Floppa Team",
    cooldown: 5,
    role: 0,
    description: { en: "Overlay rainbow pride colors on a user avatar or replied image" },
    category: "fun",
    usage: { en: "{p}gay [@mention|UID|reply]" }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    if (message && typeof message.react === "function") {
      message.react("🌈").catch(() => {});
    } else if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("🌈", event.messageID, event.threadID, () => {}, true);
    }

    let photoUrl = await extractImageUrl(event, args, api);
    let name = "Pride";

    if (!photoUrl) {
      let target = await resolveUserTarget(args, event, api);
      if (!target.id && (!args || args.length === 0) && event.senderID) {
        target = { id: String(event.senderID) };
      }
      const targetID = target.id || event.senderID;
      const profile = await resolveProfile([targetID], event, api);
      name = (profile && (profile.name || profile.username)) || (usersData && usersData.getName ? await usersData.getName(targetID) : null);
      if (!name || /^\d+$/.test(String(name).trim())) {
        name = "Pride";
      }
      photoUrl = profile && profile.profilePicture;
    }

    let tempPath = null;
    try {
      let avatar = null;
      if (photoUrl && photoUrl.startsWith("http")) {
        try {
          const res = await axios.get(photoUrl, {
            responseType: "arraybuffer",
            timeout: 15000,
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"
            }
          });
          avatar = await loadImage(Buffer.from(res.data));
        } catch (_) {}
      }

      const size = 600;
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext("2d");

      if (avatar) {
        ctx.drawImage(avatar, 0, 0, size, size);
      } else {
        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, "#2c3e50");
        grad.addColorStop(1, "#34495e");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 120px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText((name[0] || "?").toUpperCase(), size / 2, size / 2);
      }

      // Rainbow overlay with transparency
      const colors = ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#9400d3"];
      const stripeHeight = size / colors.length;

      ctx.save();
      ctx.globalAlpha = 0.45;
      for (let i = 0; i < colors.length; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(0, i * stripeHeight, size, stripeHeight);
      }
      ctx.restore();

      const tempDir = path.join(process.cwd(), "temp");
      await fs.ensureDir(tempDir);
      tempPath = path.join(tempDir, `pride_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
      await fs.writeFile(tempPath, canvas.toBuffer("image/jpeg", { quality: 0.9 }));

      const caption = `🌈 Pride colors for ${name === "Pride" ? "you" : "@" + name}! ✨`;
      const sent = await message.reply({
        body: caption,
        attachment: tempPath,
        textFirst: true
      });

      setTimeout(() => {
        if (tempPath) fs.unlink(tempPath).catch(() => {});
      }, 20000);
      return sent;
    } catch (err) {
      if (tempPath) fs.unlink(tempPath).catch(() => {});
      return message.reply(`🌈 Pride rainbow applied!`);
    }
  }
};
