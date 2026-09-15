"use strict";

/**
 * commands/avatarfx.js
 *
 * Instagram Direct Animated Avatar Effect (love, angry, laugh, cry).
 * Author: Saifullah Al Neoaz (lazyneoaz)
 * Adapted for: InstaBOT
 */

const EFFECTS = {
	love: ["love", "heart"],
	angry: ["angry", "mad"],
	laugh: ["laugh", "lol"],
	cry: ["cry", "sad"]
};

module.exports = {
	config: {
		name: "avatarfx",
		aliases: ["avfx", "avatar-effect"],
		author: "Neoaz & frnAlt",
		category: "utility",
		cooldown: 3,
		role: 0,
		shortDescription: { en: "Send text with an animated avatar character effect" },
		longDescription: { en: "Dispatches animated Instagram avatar character emotions: love, angry, laugh, cry." },
		guide: { en: "{pn} <love|angry|laugh|cry> <text>" }
	},

	onStart: async function ({ message, args }) {
		const key = (args.shift() || "").toLowerCase();
		const effect = Object.keys(EFFECTS).find(name => EFFECTS[name].includes(key));
		if (!effect) {
			return message.reply(`Pick an effect: ${Object.keys(EFFECTS).join(", ")}.\nExample: avatarfx laugh Nice one!`);
		}

		const text = args.join(" ") || "✨";
		try {
			await message.avatarEffect(text, effect);
		} catch (error) {
			return message.reply(`❌ Could not send avatar effect: ${error.message || error}`);
		}
	}
};
