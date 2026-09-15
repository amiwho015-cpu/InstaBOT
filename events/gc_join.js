"use strict";

const logger = require("../utils/logger");
const config = require("../config");

module.exports = {
	config: {
		name: "gc_join",
		aliases: ["join"],
		description: "Welcome new members joining the group"
	},

	async run(bot, data = {}) {
		try {
			if (config.LOG_EVENTS?.disableAll || !config.LOG_EVENTS?.event) return;
			const { api } = bot || {};
			const threadID = data.threadID;
			const participants = data.addedParticipants || (Array.isArray(data.userIDs) ? data.userIDs : []);

			if (!threadID || !api || !participants.length) return;

			for (const p of participants) {
				const uid = typeof p === "object" ? (p.userFbId || p.userId || p.id) : String(p);
				if (bot?.userID && String(uid) === String(bot.userID)) continue;

				let name = typeof p === "object" ? (p.fullName || p.name) : null;
				if (!name) {
					try {
						const info = await api.getUserInfo(uid);
						const u = info ? (info[uid] || Object.values(info)[0]) : null;
						if (u) name = u.fullName || u.name || (u.username ? `@${u.username}` : `User ${uid}`);
					} catch (_) {}
				}

				name = name || `User ${uid}`;
				const prefix = config.PREFIX || "!";
				await api.sendMessage(`👋 Welcome to the group, ${name}!\n\nType ${prefix}help to see what I can do.`, threadID).catch(() => {});
			}
		} catch (e) {
			logger.error("Error in gc_join event", { error: e.message });
		}
	}
};
