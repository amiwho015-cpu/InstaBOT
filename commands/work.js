"use strict";

/**
 * commands/work.js
 *
 * Work jobs to earn economy money.
 * Adapted from Floppa-Chatbot.
 */

const JOBS = [
	{ name: "Software Engineer", min: 150, max: 400, desc: "You debugged production code and fixed critical issues" },
	{ name: "Content Creator", min: 100, max: 300, desc: "You edited viral Instagram reels" },
	{ name: "Graphic Designer", min: 120, max: 280, desc: "You designed custom avatars and story covers" },
	{ name: "Cryptocurrency Trader", min: 50, max: 600, desc: "You traded altcoins with high leverage" },
	{ name: "Barista", min: 80, max: 180, desc: "You brewed premium artisanal coffees" },
	{ name: "Cybersecurity Analyst", min: 200, max: 500, desc: "You prevented a security breach" }
];

module.exports = {
	config: {
		name: "work",
		aliases: ["wk", "job"],
		author: "frnAlt",
		category: "economy",
		cooldown: 300, // 5 minutes cooldown
		role: 0,
		shortDescription: { en: "Work a job to earn money" },
		longDescription: { en: "Earn money for your wallet by completing random jobs." },
		guide: { en: "{pn}" }
	},

	onStart: async function ({ message, event, usersData, database }) {
		const job = JOBS[Math.floor(Math.random() * JOBS.length)];
		const earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

		if (usersData && typeof usersData.addMoney === "function") {
			await usersData.addMoney(event.senderID, earned);
		} else if (database && typeof database.addBalance === "function") {
			await database.addBalance(event.senderID, earned);
		}

		let text = `💼 Work Completed!\n\n`;
		text += `👔 Job: ${job.name}\n`;
		text += `📝 Details: ${job.desc}.\n`;
		text += `💰 Salary Earned: +$${earned.toLocaleString()}\n`;

		return message.reply(text);
	}
};
