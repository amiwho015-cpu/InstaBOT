"use strict";

const logger = require("../utils/logger");
const config = require("../config");

module.exports = {
	config: {
		name: "gc_leave",
		aliases: ["leave"],
		description: "Farewell notification when a member leaves the group"
	},

	async run(bot, data = {}) {
		try {
			if (config.LOG_EVENTS?.disableAll || !config.LOG_EVENTS?.event) return;
			const { api } = bot || {};
			const threadID = data.threadID;
			const userIDs = data.leftUserId ? [data.leftUserId] : (Array.isArray(data.userIDs) ? data.userIDs : []);

			if (!threadID || !api || !userIDs.length) return;

			for (const leftId of userIDs) {
				const uid = String(leftId);
				if (bot?.userID && uid === String(bot.userID)) continue;

				logger.info(`Member left thread ${threadID}: ${uid}`);
				let name = `User ${uid}`;
				try {
					const info = await api.getUserInfo(uid);
					const d = info ? (info[uid] || Object.values(info)[0]) : null;
					if (d) name = d.fullName || d.name || (d.username ? `@${d.username}` : name);
				} catch (_) {}

				await api.sendMessage(`👋 ${name} has left the group. We'll miss you!`, threadID).catch(() => {});
			}
		} catch (e) {
			logger.error("Error in gc_leave event", { error: e.message });
		}
	}
};
