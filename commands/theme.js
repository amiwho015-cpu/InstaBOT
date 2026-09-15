"use strict";

/**
 * commands/theme.js
 *
 * Graceful fallback for Facebook Messenger Thread Themes.
 */

module.exports = {
	config: {
		name: "theme",
		aliases: ["settheme", "themeinfo", "metatheme"],
		author: "frnAlt",
		category: "info",
		cooldown: 5,
		role: 0,
		shortDescription: { en: "Messenger theme compatibility notice" },
		longDescription: { en: "Provides clear feedback regarding Facebook Messenger thread themes." },
		guide: { en: "{pn}" }
	},

	onStart: async function ({ message }) {
		return message.reply(
			"ℹ️ Thread themes are exclusive to Facebook Messenger and are not supported on Instagram Direct."
		);
	}
};
