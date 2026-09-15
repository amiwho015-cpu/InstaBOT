"use strict";

const axios = require("axios");

module.exports = {
  config: {
    name: "shazam",
    aliases: ["whatsong", "findmusic", "identify"],
    version: "2.0.0",
    author: "frnAlt & Floppa Team",
    cooldown: 5,
    role: 0,
    category: "media",
    description: { en: "Identify a song from an audio or video reply" },
    usage: { en: "{p}shazam (reply to voice/audio/video)" }
  },

  onStart: async function ({ message, event, api }) {
    let audioUrl = null;

    if (event.messageReply?.attachments?.length > 0) {
      const a = event.messageReply.attachments[0];
      audioUrl = a.url;
    }

    if (!audioUrl) {
      return message.reply("🔍 𝗦𝗵𝗮𝘇𝗮𝗺 𝗦𝗼𝗻𝗴 𝗙𝗶𝗻𝗱𝗲𝗿\n\n📌 Please reply to an audio or video message with {p}shazam to identify the track!");
    }

    if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("🔍", event.messageID, () => {}, true);
    }

    try {
      const res = await axios.get(`https://kaiz-apis.gleeze.com/api/shazam?url=${encodeURIComponent(audioUrl)}`, {
        timeout: 25000
      });
      const track = res.data?.track || res.data?.data || res.data;

      if (!track || !track.title) {
        throw new Error("No match found for this audio sample.");
      }

      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      }

      return message.reply(
        `🎵 𝗦𝗵𝗮𝘇𝗮𝗺 𝗠𝗮𝘁𝗰𝗵!\n\n` +
        `🏷️ Title: ${track.title}\n` +
        `👤 Artist: ${track.subtitle || track.artist || "Unknown"}\n` +
        `💿 Album: ${track.sections?.[0]?.metadata?.[0]?.text || "Single"}\n` +
        `💡 Use {p}sing ${track.title} to download!`
      );
    } catch (err) {
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      return message.reply(`❌ Shazam could not identify this track: ${err.message}`);
    }
  }
};
