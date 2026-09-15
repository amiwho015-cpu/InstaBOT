"use strict";

/**
 * events/message.js
 *
 * Incoming message listener hook. Message execution is managed by core/dispatcher.js.
 */

const logger = require("../utils/logger");
const config = require("../config");

module.exports = {
	config: {
		name: "message",
		description: "Incoming message event handler"
	},

	async run(bot, event) {
		if (config.LOG_EVENTS?.disableAll || !config.LOG_EVENTS?.message) return;
		if (event && !event.isSelf) {
			logger.debug(`[EVENT:MESSAGE] From ${event.senderID} in ${event.threadID}: ${event.body?.slice(0, 50) || ""}`);
		}
	}
};
