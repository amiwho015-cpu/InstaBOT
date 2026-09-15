"use strict";

/**
 * edit.js — AI Image Editing, Transformations, and Local Filters.
 * Author: frnAlt & lazyneoaz
 *
 * Capabilities:
 * - Edit an image by replying to a photo message: {p}edit <prompt>
 * - Edit or transform a user's profile picture: {p}edit -pfp [target] <prompt>
 * - Local filters: {p}edit [circle|grayscale|blur|sepia|invert|rotate|flip]
 */

const axios = require("axios");
const { Jimp } = require("jimp");
const fs = require("fs-extra");
const path = require("path");
const { resolveUserTarget, resolveProfile } = require("../src/utils");

const MAX_ATTACHMENT_BYTES = 35 * 1024 * 1024;

function extractImageUrlFromEvent(event, args = []) {
  if (global.utils && typeof global.utils.extractImageUrl === "function") {
    const extracted = global.utils.extractImageUrl(event, args, { allowAvatar: false });
    if (extracted) return extracted;
  }

  if (event.messageReply?.attachments?.length > 0) {
    for (const a of event.messageReply.attachments) {
      const u = a.url || a.largePreviewUrl || a.large_preview_url || a.previewUrl || a.preview_url || a.thumbnailUrl || a.image;
      if (u) return u;
    }
  }

  if (event.attachments?.length > 0) {
    for (const a of event.attachments) {
      const u = a.url || a.largePreviewUrl || a.large_preview_url || a.previewUrl || a.preview_url || a.thumbnailUrl || a.image;
      if (u) return u;
    }
  }

  if (event.messageReply && (event.messageReply.body || event.messageReply.text)) {
    const text = event.messageReply.body || event.messageReply.text;
    const m = text.match(/https?:\/\/[^\s]+/i);
    if (m) return m[0];
  }

  if (Array.isArray(args) && args.length > 0) {
    for (const a of args) {
      if (typeof a === "string" && /^https?:\/\//i.test(a)) return a;
    }
  }

  return null;
}

async function downloadToBuffer(fileUrl) {
  const res = await axios.get(fileUrl, {
    responseType: "arraybuffer",
    timeout: 45000,
    maxContentLength: MAX_ATTACHMENT_BYTES,
    maxBodyLength: MAX_ATTACHMENT_BYTES,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  return Buffer.from(res.data);
}

module.exports = {
  config: {
    name: "edit",
    aliases: ["imgedit", "photoedit", "filterimg", "ai-edit", "transform"],
    version: "4.5.0",
    author: "frnAlt",
    cooldown: 5,
    role: 0,
    description: { en: "AI image editing, transformations, and local filters (reply to image or use -pfp)" },
    category: "image",
    usage: { en: "{p}edit <prompt> (reply to an image)\n{p}edit -pfp [@user|UID] <prompt>\n{p}edit [circle|blur|grayscale|sepia|invert|rotate|flip] (reply to image)" }
  },

  onStart: async function ({ api, event, args, message, logger }) {
    const isPfpMode = args.some(a => ["-pfp", "--pfp", "-avatar", "--avatar", "-profile"].includes(String(a).toLowerCase()));

    let prompt = "";
    let imageUrl = null;
    let targetName = null;

    if (isPfpMode) {
      const rawArgs = args.filter(a => !["-pfp", "--pfp", "-avatar", "--avatar", "-profile"].includes(String(a).toLowerCase()));
      let targetId = null;
      let promptWords = [];

      // Priority 1: Reply to another user
      if (event.messageReply?.senderID) {
        targetId = String(event.messageReply.senderID);
        promptWords = rawArgs;
      } else {
        // Priority 2: Scan for explicit target (@mention, UID, or IG link)
        for (const arg of rawArgs) {
          if (/^@([A-Za-z0-9._]{1,30})$/.test(arg)) {
            if (!targetId) targetId = arg.replace(/^@/, "");
          } else if (/^\d{4,}$/.test(arg)) {
            if (!targetId) targetId = arg;
          } else if (/instagram\.com\/([A-Za-z0-9._]+)/i.test(arg)) {
            const m = arg.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
            if (!targetId && m) targetId = m[1];
          } else {
            promptWords.push(arg);
          }
        }
      }

      // Priority 3: Fall back to sender themselves
      if (!targetId) {
        targetId = String(event.senderID || "");
      }

      prompt = promptWords.join(" ").trim();
      if (!prompt) prompt = "enhance photo, high quality 4k portrait masterpiece";

      // Resolve profile
      if (targetId) {
        try {
          const profile = await resolveProfile([targetId], event, api);
          if (profile && profile.profilePicture) {
            imageUrl = profile.profilePicture;
            targetName = profile.name || profile.username || targetId;
          }
        } catch (_) {}

        if (!imageUrl && api && typeof api.getUserInfo === "function") {
          try {
            const info = await new Promise((res, rej) => api.getUserInfo(targetId, (e, r) => e ? rej(e) : res(r)));
            const p = info && (info[targetId] || Object.values(info)[0]);
            if (p && p.profilePicture) {
              imageUrl = p.profilePicture;
              targetName = p.name || p.username || targetId;
            }
          } catch (_) {}
        }
      }

      if (!imageUrl) {
        return message.reply(`❌ Could not fetch profile picture for user ${targetId || "target"}. Please ensure the profile is accessible.`);
      }
    } else {
      imageUrl = extractImageUrlFromEvent(event, args);
      if (imageUrl && args.length > 0 && args[0].startsWith("http")) {
        prompt = args.slice(1).join(" ").trim();
      } else {
        prompt = args.join(" ").trim();
      }

      if (!imageUrl && prompt) {
        try {
          const profile = await resolveProfile([event.senderID], event, api);
          if (profile && profile.profilePicture) {
            imageUrl = profile.profilePicture;
            targetName = profile.name || profile.username || event.senderID;
            isPfpMode = true;
          }
        } catch (_) {}
      }
    }

    if (!imageUrl) {
      return message.reply(
        "📸 𝗣𝗵𝗼𝘁𝗼 & 𝗣𝗙𝗣 𝗘𝗱𝗶𝘁𝗼𝗿\n\n" +
        "📌 Usage:\n" +
        "• Reply to any image message with: {p}edit <prompt>\n" +
        "• Edit your own profile picture: {p}edit -pfp <prompt>\n" +
        "• Edit another user's profile picture: {p}edit -pfp @user <prompt>\n" +
        "• Canvas filters: {p}edit [circle|grayscale|blur|sepia|invert|rotate|flip]\n\n" +
        "💡 Example: {p}edit -pfp cyberpunk anime portrait"
      );
    }

    if (!prompt && !isPfpMode) {
      return message.reply(
        "⚠️ Please provide an edit prompt or effect instruction.\n\n" +
        "💡 Example: (reply to photo) {p}edit cyberpunk style\n" +
        "💡 Canvas filters: circle, rounded, blur, grayscale, sepia, invert, rotate, flip, resize"
      );
    }

    if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
    }

    const CANVAS_ACTIONS = [
      "circle", "rounded", "resize", "rotate", "flip",
      "blur", "grayscale", "greyscale", "sepia", "invert",
      "brightness", "contrast"
    ];
    const firstWord = (prompt.split(/\s+/)[0] || "").toLowerCase();
    const isCanvasAction = CANVAS_ACTIONS.includes(firstWord);

    let tempFilePath = null;

    try {
      let finalBuffer = null;
      let appliedType = "AI Edit";

      // 1. Local Canvas Filter Processing
      if (isCanvasAction) {
        appliedType = `Canvas: ${firstWord.toUpperCase()}`;
        const action = firstWord;
        const actionArgs = prompt.split(/\s+/).slice(1);

        const sourceBuffer = await downloadToBuffer(imageUrl);
        const jimg = await Jimp.read(sourceBuffer);

        if (action === "circle" || action === "rounded") {
          jimg.circle();
        } else if (action === "grayscale" || action === "greyscale") {
          jimg.greyscale();
        } else if (action === "sepia") {
          jimg.sepia();
        } else if (action === "invert") {
          jimg.invert();
        } else if (action === "blur") {
          const radius = parseInt(actionArgs[0], 10) || 10;
          jimg.blur(Math.min(25, Math.max(1, radius)));
        } else if (action === "rotate") {
          const deg = parseInt(actionArgs[0], 10) || 90;
          jimg.rotate(deg);
        } else if (action === "flip") {
          const vertical = (actionArgs[0] || "").toLowerCase().startsWith("v");
          jimg.flip({ horizontal: !vertical, vertical });
        } else if (action === "resize" && actionArgs[0] && actionArgs[1]) {
          const w = parseInt(actionArgs[0], 10) || 512;
          const h = parseInt(actionArgs[1], 10) || 512;
          jimg.resize({ w: Math.min(1920, w), h: Math.min(1920, h) });
        } else if (action === "brightness") {
          const val = parseInt(actionArgs[0], 10) || 20;
          jimg.color([{ apply: val >= 0 ? "brighten" : "darken", params: [Math.abs(val)] }]);
        } else if (action === "contrast") {
          const val = parseFloat(actionArgs[0]) || 0.3;
          jimg.contrast(Math.min(1, Math.max(-1, val)));
        }

        finalBuffer = await jimg.getBuffer("image/jpeg");
      }

      // 2. Primary AI Edit API
      if (!finalBuffer) {
        let targetUrl = imageUrl;
        try {
          if (!imageUrl.includes("imgur.com")) {
            const imgurRes = await axios.get(
              `https://toshiro-api-editz6t9.vercel.app/api/tools/Imgur?url=${encodeURIComponent(imageUrl)}`,
              { timeout: 15000 }
            );
            if (imgurRes.data?.success && imgurRes.data?.result?.url) {
              targetUrl = imgurRes.data.result.url;
            }
          }
          const editApiUrl = `https://toshiro-api-editz6t9.vercel.app/api/image/edit?url=${encodeURIComponent(targetUrl)}&prompt=${encodeURIComponent(prompt)}`;
          const editRes = await axios.get(editApiUrl, { timeout: 35000 });
          if (editRes.data?.success && editRes.data?.url) {
            finalBuffer = await downloadToBuffer(editRes.data.url);
            appliedType = "AI Edit";
          }
        } catch (_) {}
      }

      // 3. Fallback: Pollinations Image-to-Image / Variation
      if (!finalBuffer) {
        try {
          const turboUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?image=${encodeURIComponent(imageUrl)}&width=768&height=768&model=turbo&nologo=true`;
          finalBuffer = await downloadToBuffer(turboUrl);
          appliedType = "AI Turbo Edit";
        } catch (_) {
          const sourceBuffer = await downloadToBuffer(imageUrl);
          const jimg = await Jimp.read(sourceBuffer);
          jimg.contrast(0.2);
          finalBuffer = await jimg.getBuffer("image/jpeg");
          appliedType = "Enhanced Edit";
        }
      }

      if (!finalBuffer || !Buffer.isBuffer(finalBuffer)) {
        throw new Error("Could not produce edited image buffer.");
      }

      // Write to clean temp JPEG file for Instagram transport
      const tempDir = path.join(process.cwd(), "temp");
      await fs.ensureDir(tempDir);
      tempFilePath = path.join(tempDir, `edit_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
      await fs.writeFile(tempFilePath, finalBuffer);

      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      }

      const caption = targetName
        ? `✨ [${appliedType}] Edited profile picture of ${targetName}:\nPrompt: "${prompt}"`
        : `✨ [${appliedType}] Result:\nPrompt: "${prompt}"`;

      const sent = await message.reply({
        body: caption,
        attachment: tempFilePath,
        textFirst: true
      });

      // Cleanup temp file safely after short delay
      setTimeout(() => {
        if (tempFilePath) fs.unlink(tempFilePath).catch(() => {});
      }, 15000);

      return sent;
    } catch (err) {
      if (tempFilePath) fs.unlink(tempFilePath).catch(() => {});
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      return message.reply(`❌ Failed to edit image: ${err.message || err}`);
    }
  }
};
