"use strict";

/**
 * commands/uptime.js
 *
 * System uptime and operational status.
 */

const os = require("os");

function formatUptime(seconds) {
	const d = Math.floor(seconds / (3600 * 24));
	const h = Math.floor((seconds % (3600 * 24)) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	const parts = [];
	if (d > 0) parts.push(`${d}d`);
	if (h > 0) parts.push(`${h}h`);
	if (m > 0) parts.push(`${m}m`);
	parts.push(`${s}s`);
	return parts.join(" ");
}

module.exports = {
	config: {
		name: "uptime",
		aliases: ["upt", "up"],
		author: "frnAlt",
		category: "system",
		cooldown: 5,
		role: 0,
		shortDescription: { en: "Show bot uptime and system resource usage" },
		longDescription: { en: "Displays total uptime, OS uptime, CPU architecture, and memory footprint." },
		guide: { en: "{pn}" }
	},

	onStart: async function ({ message, bot }) {
		const botUptime = formatUptime(process.uptime());
		const systemUptime = formatUptime(os.uptime());
		const mem = process.memoryUsage();
		const rssMb = (mem.rss / 1024 / 1024).toFixed(1);
		const heapMb = (mem.heapUsed / 1024 / 1024).toFixed(1);

		let msg = `🤖 InstaBOT System Status\n\n`;
		msg += `⏱️ Bot Uptime   : ${botUptime}\n`;
		msg += `🖥️ System Uptime: ${systemUptime}\n`;
		msg += `💾 Heap Memory  : ${heapMb} MB\n`;
		msg += `📦 Resident Mem : ${rssMb} MB\n`;
		msg += `⚙️ Node Version : ${process.version}\n`;
		msg += `🛰️ Platform     : ${os.type()} (${os.arch()})\n`;
		msg += `⚡ Commands Loaded: ${bot.commandLoader ? bot.commandLoader.commands.size : 0}`;

		return message.reply(msg);
	}
};
