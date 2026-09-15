"use strict";

/**
 * commands/friendlist.js
 *
 * Graceful fallback for Facebook Friends list.
 */

module.exports = {
	config: {
		name: "friendlist",
		aliases: ["friends", "addfriend", "autoaddfriend"],
		author: "frnAlt",
		category: "info",
		cooldown: 5,
		role: 0,
		shortDescription: { en: "Facebook friend list compatibility notice" },
		longDescription: { en: "Informs user that Facebook Friends are not applicable on Instagram Direct." },
		guide: { en: "{pn}" }
	},

	onStart: async function ({ message }) {
		return message.reply(
			"ℹ️ Friend requests and friend lists are Facebook-specific features. On Instagram, conversations are managed via Direct Messaging and user profiles."
		);
	}
};
