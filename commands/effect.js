"use strict";

/**
 * commands/effect.js
 *
 * Instagram Direct Animated Text Effect (Power-ups: love, gift, celebration, fire).
 * Author: Saifullah Al Neoaz (lazyneoaz)
 * Adapted for: InstaBOT
 */

module.exports = {
	config: {
		name: "effect",
		aliases: ["fx", "texteffect"],
		author: "Neoaz & frnAlt",
		category: "utility",
		cooldown: 3,
		role: 0,
		shortDescription: { en: "Send text with an Instagram power-up effect" },
		longDescription: { en: "Dispatches animated Instagram text effects: love (hearts), gift (gift box), celebration (confetti), fire (flames)." },
		guide: { en: "{pn} <love|gift|celebration|fire> <text>" }
	},

	onStart: async function ({ message, args }) {
		const effects = ["love", "gift", "celebration", "fire"];
		const effect = (args.shift() || "").toLowerCase();
		if (!effects.includes(effect)) {
			return message.reply(`Pick an effect: ${effects.join(", ")}.\nExample: effect fire Hello!`);
		}
		const text = args.join(" ") || "✨";
		try {
			await message.effect(text, effect);
		} catch (error) {
			return message.reply(`❌ Could not send text effect: ${error.message || error}`);
		}
	}
};
