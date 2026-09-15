"use strict";

const axios = require("axios");
const { Jimp } = require("jimp");
const { Readable } = require("stream");
const { resolveUserTarget, resolveProfile } = require("../src/utils");

const MAX_ATTACHMENT_BYTES = 26214400;

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

  if (Array.isArray(args) && args.length > 0 && typeof args[0] === "string" && /^https?:\/\//i.test(args[0])) {
    return args[0];
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
    version: "4.2.0",
    author: "frnAlt",
    cooldown: 5,
    role: 0,
    description: "AI image editing, transformations, and local filters (reply to image or use -pfp)",
    category: "image",
    usage: "{p}edit <prompt> (reply to an image)\n{p}edit -pfp <prompt> (reply to user or mention)\n{p}edit [circle|grayscale|blur|sepia|invert|rotate|flip] (reply to image)"
  },

  onStart: async function ({ api, event, args, message, logger }) {
    const isPfpMode = args.some(a => ["-pfp", "--pfp", "-avatar", "--avatar", "-profile"].includes(String(a).toLowerCase()));

    let prompt = "";
    let imageUrl = null;
    let targetName = null;

    if (isPfpMode) {
      const filteredArgs = args.filter(a => !["-pfp", "--pfp", "-avatar", "--avatar", "-profile"].includes(String(a).toLowerCase()));
      const target = await resolveUserTarget(filteredArgs, event, api);
      if (target.id) {
        const profile = await resolveProfile(filteredArgs, event, api);
        if (profile && profile.profilePicture) {
          imageUrl = profile.profilePicture;
          targetName = profile.name || profile.username || target.id;
        }
      }
      prompt = filteredArgs.filter(a => !/^\d{4,}$/.test(a) && !a.startsWith("@")).join(" ").trim();
      if (!prompt) prompt = "enhance photo, high quality 4k portrait masterpiece";
    } else {
      imageUrl = extractImageUrlFromEvent(event, args);
      if (imageUrl && args.length > 0 && args[0].startsWith("http")) {
        prompt = args.slice(1).join(" ").trim();
      } else {
        prompt = args.join(" ").trim();
      }
    }

    if (!imageUrl) {
      return message.reply(
        "📸 Please reply to an image message or use: {p}edit -pfp <prompt>\n\n💡 Example: Reply to a photo with: {p}edit make it cyberpunk anime style\n💡 Example: {p}edit -pfp anime portrait"
      );
    }

    if (!prompt && !isPfpMode) {
      return message.reply(
        "⚠️ Please provide an edit prompt or effect instruction.\n\n💡 Example: (reply to photo) {p}edit cyberpunk style\n💡 Canvas filters: circle, rounded, blur, grayscale, sepia, invert, rotate, flip, resize"
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
    const firstArg = (args[0] || "").toLowerCase();

    try {
      let finalStream = null;
      let appliedType = "AI Edit";

      if (CANVAS_ACTIONS.includes(firstArg)) {
        appliedType = `Canvas: ${firstArg.toUpperCase()}`;
        const action = firstArg;
        const jimg = await Jimp.read(imageUrl);

        if (action === "circle" || action === "rounded") {
          jimg.circle();
        } else if (action === "grayscale" || action === "greyscale") {
          jimg.greyscale();
        } else if (action === "sepia") {
          jimg.sepia();
        } else if (action === "invert") {
          jimg.invert();
        } else if (action === "blur") {
          const radius = parseInt(args[1], 10) || 10;
          jimg.blur(Math.min(25, Math.max(1, radius)));
        } else if (action === "rotate") {
          const deg = parseInt(args[1], 10) || 90;
          jimg.rotate(deg);
        } else if (action === "flip") {
          const vertical = (args[1] || "").toLowerCase().startsWith("v");
          jimg.flip({ horizontal: !vertical, vertical });
        } else if (action === "resize" && args[1] && args[2]) {
          const w = parseInt(args[1], 10) || 512;
          const h = parseInt(args[2], 10) || 512;
          jimg.resize({ w: Math.min(1920, w), h: Math.min(1920, h) });
        } else if (action === "brightness") {
          const val = parseInt(args[1], 10) || 20;
          jimg.color([{ apply: val >= 0 ? "brighten" : "darken", params: [Math.abs(val)] }]);
        } else if (action === "contrast") {
          const val = parseFloat(args[1]) || 0.3;
          jimg.contrast(Math.min(1, Math.max(-1, val)));
        }

        const buf = await jimg.getBuffer("image/png");
        finalStream = Readable.from(buf);
        finalStream.path = `edit_${action}.png`;
      }

      if (!finalStream) {
        let targetUrl = imageUrl;
        try {
          if (!imageUrl.includes("imgur.com")) {
            const imgurRes = await axios.get(`https://toshiro-api-editz6t9.vercel.app/api/tools/Imgur?url=${encodeURIComponent(imageUrl)}`, { timeout: 15000 });
            if (imgurRes.data?.success && imgurRes.data?.result?.url) {
              targetUrl = imgurRes.data.result.url;
            }
          }
          const editApiUrl = `https://toshiro-api-editz6t9.vercel.app/api/image/edit?url=${encodeURIComponent(targetUrl)}&prompt=${encodeURIComponent(prompt)}`;
          const editRes = await axios.get(editApiUrl, { timeout: 40000 });
          if (editRes.data?.success && editRes.data?.url) {
            const buffer = await downloadToBuffer(editRes.data.url);
            finalStream = Readable.from(buffer);
            finalStream.path = "edited.png";
            appliedType = "AI Edit";
          }
        } catch (editApiErr) {
          // Fall through to pollinations fallback
        }
      }

      if (!finalStream) {
        try {
          const turboUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?image=${encodeURIComponent(imageUrl)}&width=768&height=768&model=turbo&nologo=true`;
          finalStream = await global.utils.getStreamFromURL(turboUrl, "edit.jpg", { timeout: 25000 });
          appliedType = "AI Turbo Edit";
        } catch (turboErr) {
          const jimg = await Jimp.read(imageUrl);
          jimg.contrast(0.2);
          const buf = await jimg.getBuffer("image/png");
          finalStream = Readable.from(buf);
          finalStream.path = "edit.png";
          appliedType = "Enhanced Edit";
        }
      }

      if (!finalStream) {
        throw new Error("Could not produce edited image stream.");
      }

      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      }

      const caption = targetName
        ? `✨ [${appliedType}] Edited profile picture of ${targetName}:\nPrompt: "${prompt}"`
        : `✨ [${appliedType}] Result:\nPrompt: "${prompt}"`;

      await message.reply({
        body: caption,
        attachment: finalStream
      });
    } catch (err) {
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      return message.reply(`❌ Failed to edit image: ${err.message || err}`);
    }
  }
};
