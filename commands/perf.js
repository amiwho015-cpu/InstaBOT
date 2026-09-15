"use strict";

/**
 * commands/perf.js
 *
 * Real-time bot performance diagnostics.
 * Adapted from Floppa-Chatbot.
 */

const os = require("os");

module.exports = {
	config: {
		name: "perf",
		aliases: ["benchmark", "bench"],
		author: "frnAlt",
		category: "system",
		cooldown: 5,
		role: 0,
		shortDescription: { en: "Display system performance & latency metrics" },
		longDescription: { en: "Benchmarks memory footprint, event loop response time, and OS load." },
		guide: { en: "{pn}" }
	},

	onStart: async function ({ message, bot }) {
		const start = process.hrtime();

		// Measure simple loop
		let ops = 0;
		const endLoop = Date.now() + 10;
		while (Date.now() < endLoop) ops++;

		const diff = process.hrtime(start);
		const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

		const mem = process.memoryUsage();
		const rss = (mem.rss / 1024 / 1024).toFixed(1);
		const heap = (mem.heapUsed / 1024 / 1024).toFixed(1);
		const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
		const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);

		let msg = `⚡ PERFORMANCE BENCHMARK ⚡\n\n`;
		msg += `⏱️ Loop Benchmark: ${ops.toLocaleString()} ops in ${durationMs}ms\n`;
		msg += `💾 Node Heap    : ${heap} MB / ${rss} MB RSS\n`;
		msg += `🖥️ System RAM   : ${freeMem} MB free of ${totalMem} MB\n`;
		msg += `🧠 CPU Load Avg : ${os.loadavg().map(v => v.toFixed(2)).join(", ")}\n`;
		msg += `📦 Active Tasks : ${bot.scheduler?.timers?.length || 0} schedulers`;

		return message.reply(msg);
	}
};
