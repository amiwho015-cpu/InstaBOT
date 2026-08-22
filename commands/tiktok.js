const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tt"],
    version: "1.0.1",
    author: "Neoaz ゐ",
    cooldown: 5,
    role: 0,
    description: "Search and download TikTok video",
    category: "media",
    usage: "tiktok <search query>"
  },

  onStart: async function ({ api, args, event, message, commandName }) {
    const query = args.join(" ");
    if (!query) return message.reply("❌ Provide a search query.");

    try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);
        const rawData = searchResponse.data;
        const results = (Array.isArray(rawData) ? rawData : (rawData?.results || rawData?.data || rawData?.videos || [])).slice(0, 6);

        if (!results || results.length === 0) {
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return message.reply("❌ No TikTok videos found for the query.");
        }

        let messageBody = "Found " + results.length + " videos.\n\n";
        results.forEach((video, index) => {
            const title = (video.title || video.desc || 'TikTok Video').substring(0, 70);
            const creator = video.author?.unique_id || video.author?.nickname || video.author || 'creator';
            const duration = video.duration || 'n/a';
            messageBody += `${index + 1}. ${title}\n`;
            messageBody += `   • Creator: @${creator}\n`;
            messageBody += `   • Duration: ${duration}s\n\n`;
        });
        messageBody += "Reply with the number (1-" + results.length + ") to download.";

        await message.reply(messageBody, (err, info) => {
            if (err) return;
            global.GoatBot.onReply.set(info.messageID, {
                commandName: commandName,
                author: event.senderID,
                results: results
            });
        });
    } catch (error) {
        console.error("TikTok Search Error:", error);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        message.reply("❌ Failed to search TikTok.");
    }
  },

  onReply: async function ({ event, api, Reply, message }) {
    if (!Reply || !Array.isArray(Reply.results) || Reply.results.length === 0) return;
    if (Reply.author && event.senderID !== Reply.author) return;
    const selection = parseInt(event.body);
    const results = Reply.results;

    if (isNaN(selection) || selection < 1 || selection > results.length) {
      return message.reply("❌ Invalid selection. Choose 1-" + results.length);
    }

    const video = results[selection - 1];
    if (!video) return message.reply("❌ Video not found.");
    if (event.messageReply?.messageID && api?.unsendMessage) api.unsendMessage(event.messageReply.messageID).catch(() => {});
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
        const title = video.title || video.desc || 'TikTok Video';
        const creator = video.author?.unique_id || video.author?.nickname || video.author || 'creator';
        const videoUrl = video.videoUrl || video.url || video.play || video.download_url;
        await message.reply({
            body: `✅ Downloaded: ${title}\nCreator: @${creator}`,
            attachment: videoUrl
        });
        api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (error) {
        console.error("TikTok Download Error:", error);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        message.reply("❌ Failed to download the video.");
    }
  }
};
