"use strict";

/**
 * commands/top.js
 *
 * Leaderboard of richest and most active users.
 * Adapted from Floppa-Chatbot.
 */

module.exports = {
	config: {
		name: "top",
		aliases: ["leaderboard", "richest", "lb"],
		author: "frnAlt",
		category: "economy",
		cooldown: 5,
		role: 0,
		shortDescription: { en: "View global economic and activity leaderboard" },
		longDescription: { en: "Lists the top wealthiest users across the bot ecosystem." },
		guide: { en: "{pn} [money | msg]" }
	},

	onStart: async function ({ message, args, database }) {
		const type = (args[0] || "money").toLowerCase();
		const allUsers = (database && typeof database.getAllUsers === "function")
			? database.getAllUsers()
			: (database?.data?.users ? Object.values(database.data.users) : []);

		if (!allUsers || !allUsers.length) {
			return message.reply("📊 No user records found in the database yet.");
		}

		if (type === "msg" || type === "messages") {
			const sorted = allUsers
				.filter(u => u && u.messageCount)
				.sort((a, b) => (b.messageCount || 0) - (a.messageCount || 0))
				.slice(0, 10);

			let text = `🏆 TOP 10 MOST ACTIVE USERS 🏆\n\n`;
			sorted.forEach((u, i) => {
				const name = u.name || (u.username ? `@${u.username}` : (u.id || "Unknown"));
				text += `${i + 1}. ${name} — ${(u.messageCount || 0).toLocaleString()} msgs\n`;
			});
			return message.reply(text);
		}

		// Top by money / balance
		const sorted = allUsers
			.filter(u => u)
			.sort((a, b) => {
				const balA = (a.economy?.balance || a.money || a.balance || 0);
				const balB = (b.economy?.balance || b.money || b.balance || 0);
				return balB - balA;
			})
			.slice(0, 10);

		let text = `💎 TOP 10 RICHEST USERS 💎\n\n`;
		sorted.forEach((u, i) => {
			const name = u.name || (u.username ? `@${u.username}` : (u.id || "Unknown"));
			const bal = (u.economy?.balance || u.money || u.balance || 0);
			text += `${i + 1}. ${name} — $${bal.toLocaleString()}\n`;
		});

		return message.reply(text);
	}
};
