"use strict";

const { resolveUserTarget, resolveProfile, isRateLimitError } = require("../src/utils");

module.exports = {
	config: {
		name: "pfp",
		aliases: ["profilepic", "getpfp", "userpic", "dp", "pp", "avatarof"],
		version: "2.5.0",
		author: "frnAlt & Neoaz 🐊",
		category: "info",
		cooldown: 3,
		role: 0,
		description: { en: "Send a user's profile picture" },
		usage: { en: "{p}pfp [userID | @handle | username | profile URL] — or reply to a message" }
	},

	onStart: async function ({ message, args, event, api }) {
		let target = await resolveUserTarget(args, event, api);
		if (!target.id && (!args || args.length === 0) && event.senderID) {
			target = { id: String(event.senderID), source: "self" };
		}
		if (!target.id) {
			if (target.rateLimited) return message.reply("Instagram is rate-limiting lookups right now. Please try again in a few minutes.");
			if (target.username) return message.reply(`Could not find @${target.username}.`);
			return message.reply("Provide a numeric user id or @mention, or reply to a user's message.");
		}

		const profile = await resolveProfile(args && args.length > 0 ? args : [target.id], event, api);
		const picture = profile && profile.profilePicture;
		if (!picture) {
			if (profile && profile.rateLimited) return message.reply("Instagram is rate-limiting lookups right now. Please try again in a few minutes.");
			return message.reply(`Could not find a profile picture for ${target.id}.`);
		}

		const name = (profile && (profile.name || profile.username)) || target.id;
		try {
			await message.reply({ attachment: picture, body: name, textFirst: true });
		} catch (sendErr) {
			// If sending remote picture URL directly fails, download locally with browser headers and retry
			const fs = require("fs-extra");
			const path = require("path");
			const axios = require("axios");
			const tempDir = path.join(process.cwd(), "temp");
			await fs.ensureDir(tempDir);
			const tempPath = path.join(tempDir, `pfp_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
			try {
				const res = await axios.get(picture, {
					responseType: "arraybuffer",
					timeout: 15000,
					headers: {
						"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
						"Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"
					}
				});
				await fs.writeFile(tempPath, Buffer.from(res.data));
				await message.reply({ attachment: tempPath, body: name, textFirst: true });
				setTimeout(() => fs.unlink(tempPath).catch(() => {}), 20000);
			} catch (_) {
				if (fs.existsSync(tempPath)) fs.unlink(tempPath).catch(() => {});
				throw sendErr;
			}
		}
	}
};
