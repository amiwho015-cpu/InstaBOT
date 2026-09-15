"use strict";

/**
 * aiphoto.js — High Definition AI Photo Generation & Image Variations.
 * Author: frnAlt & Neoaz
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "aiphoto",
    aliases: ["photo", "aiimage", "aip", "imagine"],
    version: "2.5.0",
    author: "frnAlt & Neoaz",
    cooldown: 6,
    role: 0,
    description: { en: "Generate high quality AI photos or image variations from prompts" },
    category: "image",
    usage: { en: "{p}aiphoto <prompt> | or reply to an image with {p}aiphoto <prompt>" }
  },

  onStart: async function ({ message, args, event, api }) {
    let prompt = args.join(" ").trim();

    // Check if replying to an image to do image-to-image variation
    let replyImageUrl = null;
    if (event.messageReply?.attachments?.length > 0) {
      for (const a of event.messageReply.attachments) {
        const u = a.url || a.largePreviewUrl || a.previewUrl || a.image;
        if (u) {
          replyImageUrl = u;
          break;
        }
      }
    }

    if (!prompt && !replyImageUrl) {
      return message.reply(
        "🎨 𝗔𝗜 𝗣𝗵𝗼𝘁𝗼 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗼𝗿\n\n" +
        "📌 Usage:\n" +
        "• {p}aiphoto <prompt> — create high quality realistic AI photo\n" +
        "• (reply to photo) {p}aiphoto <prompt> — create AI variation of photo\n\n" +
        "💡 Example: {p}aiphoto futuristic neon city in Tokyo at rainy night, 8k resolution"
      );
    }

    if (!prompt && replyImageUrl) {
      prompt = "cinematic photorealistic masterpiece portrait, highly detailed 8k";
    }

    if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("🎨", event.messageID, () => {}, true);
    }

    try {
      const seed = Math.floor(Math.random() * 9999999);
      let imageUrl = "";

      if (replyImageUrl) {
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?image=${encodeURIComponent(replyImageUrl)}&width=768&height=768&seed=${seed}&nologo=true&model=turbo`;
      } else {
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&seed=${seed}&nologo=true&model=flux`;
      }

      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      }

      const caption = `✨ 𝗔𝗜 𝗣𝗵𝗼𝘁𝗼: "${prompt}"\n[Model: ${replyImageUrl ? "Turbo Variation" : "Flux 8K"}]`;

      return await message.reply({
        body: caption,
        attachment: imageUrl,
        textFirst: true
      });
    } catch (err) {
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      return message.reply(`❌ Failed to generate AI photo: ${err.message || err}`);
    }
  }
};
