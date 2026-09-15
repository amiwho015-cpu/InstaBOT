"use strict";

/**
 * commands/spamban.js
 *
 * Manage flood/spam protection bans.
 * Adapted from Floppa-Chatbot.
 */

module.exports = {
	config: {
		name: "spamban",
		aliases: ["antispam", "unspamban"],
		author: "frnAlt",
		category: "admin",
		cooldown: 5,
		role: 2, // Bot Admin
		shortDescription: { en: "Inspect or lift spam flood bans" },
		longDescription: { en: "Lists threads currently banned by the anti-spam tracker or unbans a thread." },
		guide: { en: "{pn} list | {pn} unban <threadID>" }
	},

	onStart: async function ({ message, args, bot, event }) {
		const action = (args[0] || "list").toLowerCase();
		const spam = bot.dispatcher?.spam;

		if (!spam) {
			return message.reply("⚠️ Anti-spam middleware is not active.");
		}

		if (action === "unban") {
			const target = args[1] || event.threadID;
			spam.unban(target);
			return message.reply(`✅ Thread "${target}" has been unbanned from spam tracking.`);
		}

		const isCurrentBanned = spam.isBanned(event.threadID);
		let msg = `🛡️ SPAM TRACKER STATUS 🛡️\n\n`;
		msg += `📍 Current Thread: ${isCurrentBanned ? "🔴 BANNED" : "🟢 ACTIVE"}\n`;
		msg += `💡 To unban this thread: spamban unban ${event.threadID}`;
		return message.reply(msg);
	}
};
