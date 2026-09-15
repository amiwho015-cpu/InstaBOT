"use strict";

/**
 * commands/getfbstate.js
 *
 * Graceful fallback for Facebook AppState extraction.
 */

module.exports = {
	config: {
		name: "getfbstate",
		aliases: ["fbstate", "appstate"],
		author: "frnAlt",
		category: "info",
		cooldown: 5,
		role: 2,
		shortDescription: { en: "Session state compatibility notice" },
		longDescription: { en: "Provides information about Instagram Direct session persistence." },
		guide: { en: "{pn}" }
	},

	onStart: async function ({ message, bot }) {
		return message.reply(
			`ℹ️ "fbstate" is designed for Facebook Messenger.\nThis bot runs on Instagram ICA. Your Instagram session is actively managed and saved in "${bot.config.ACCOUNT_FILE || "account.txt"}".`
		);
	}
};
