"use strict";

/**
 * commands/music.js
 *
 * Search and attach Instagram Music Stickers.
 * Author: Saifullah Al Neoaz (lazyneoaz)
 * Adapted for: InstaBOT
 */

function formatDuration(ms) {
	if (!ms || ms < 0) return "0:00";
	const total = Math.round(ms / 1000);
	const minutes = Math.floor(total / 60);
	const seconds = String(total % 60).padStart(2, "0");
	return `${minutes}:${seconds}`;
}

module.exports = {
	config: {
		name: "music",
		aliases: ["stickermusic", "sm", "igmusic"],
		author: "Neoaz & frnAlt",
		category: "media",
		cooldown: 5,
		role: 0,
		shortDescription: { en: "Search a song and send it as an Instagram music sticker" },
		longDescription: { en: "Searches the official Instagram music catalogue and sends interactive music audio clips." },
		guide: { en: "{pn} <song name or artist>" }
	},

	onStart: async function ({ message, args, event }) {
		const query = args.join(" ").trim();
		if (!query) {
			return message.reply("💡 Usage: music <song name or artist>\nExample: music blinding lights");
		}

		let searchRes;
		try {
			searchRes = await message.musicSearch(query);
		} catch (error) {
			return message.reply(`❌ Music search failed: ${error.message || error}`);
		}

		const tracks = (searchRes && searchRes.tracks) || (Array.isArray(searchRes) ? searchRes : []);
		if (!tracks.length) {
			return message.reply(`❌ No songs found on Instagram for "${query}".`);
		}

		const top = tracks.slice(0, 5);

		// If only 1 result, send it directly
		if (top.length === 1) {
			try {
				return await message.music(top[0]);
			} catch (err) {
				return message.reply(`❌ Could not send music sticker: ${err.message}`);
			}
		}

		let text = `🎵 Instagram Music Results for "${query}":\n\n`;
		top.forEach((t, i) => {
			const title = t.title || t.name || "Unknown";
			const artist = t.artist || t.display_artist || "Unknown";
			const dur = formatDuration(t.durationMs || t.duration_ms || 30000);
			text += `${i + 1}. ${title} — ${artist} (${dur})\n`;
		});
		text += `\n💬 Reply to this message with the number (1-${top.length}) to send the music sticker.`;

		const sent = await message.reply(text);

		if (global.GoatBot?.onReply && sent && sent.messageID) {
			global.GoatBot.onReply.set(String(sent.messageID), {
				commandName: "music",
				author: event.senderID,
				messageID: sent.messageID,
				tracks: top
			});
		}
	},

	onReply: async function ({ message, event, Reply }) {
		const input = (event.body || "").trim();
		const index = parseInt(input, 10);
		const tracks = Reply.tracks || [];

		if (isNaN(index) || index < 1 || index > tracks.length) {
			return message.reply(`⚠️ Please reply with a valid number between 1 and ${tracks.length}.`);
		}

		const chosen = tracks[index - 1];
		try {
			await message.music(chosen);
		} catch (err) {
			return message.reply(`❌ Could not send music sticker: ${err.message}`);
		}
	}
};
