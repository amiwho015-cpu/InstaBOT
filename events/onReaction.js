"use strict";

/**
 * onReaction — runs for reaction events.
 * Removes messages that an authorised user marks with a hand or trash emoji.
 *
 * Instagram only lets an account unsend its OWN messages, so the practical
 * targets are messages the bot itself sent. Authorised actors:
 *   - bot admins (config.adminBot / devUsers),
 *   - thread admins (group admin list),
 *   - the other participant in a DM.
 * The bot can never delete other people's messages on Instagram, so those
 * reactions are ignored (they were silently failing before anyway).
 */

const log = require("../src/logger");

const HAND_EMOJIS = [
	"✋", "👌", "👍", "👏", "🙌", "👐", "🤲", "🙏", "🗑️", "🗑"
];

module.exports = {
	config: {
		name: "onReaction",
		category: "system",
		eventType: "message_reaction"
	},

	// The dispatcher calls scripts via onEvent(...). Keep onStart as an alias so
	// any caller using the other name still works.
	onEvent: async function (ctx) { return module.exports.onStart(ctx); },

	onStart: async function ({ event, bot, api, config, threadData }) {
		const reaction = typeof event?.reaction === "string"
			? event.reaction
			: event?.reaction?.emoji;
		if (!reaction || event.reactionStatus === "deleted") return;
		if (!HAND_EMOJIS.some(emoji => reaction.includes(emoji))) return;

		const senderID = String(event.senderID || event.userID || "").trim();
		const targetID = String(event.targetMessageID || event.target_message_id || event.messageID || "").trim();
		const eventThreadID = event.threadID || event.thread_id;
		if (!senderID || !targetID || !eventThreadID) return;

		const client = api || bot?.api;
		if (!client || typeof client.unsendMessage !== "function") return;

		const botID = String(
			(client && typeof client.getCurrentUserID === "function" && client.getCurrentUserID()) ||
			bot?.userID || ""
		).trim();

		// Only messages the bot itself sent can be unsent on Instagram.
		const cached = global.recentMessages?.get?.(String(targetID));
		if (cached?.senderID && botID && String(cached.senderID) !== botID) return;
		if (!cached && !botID) return; // cannot verify ownership at all

		const configuredAdmins = [
			...(Array.isArray(config?.adminBot) ? config.adminBot : []),
			...(Array.isArray(config?.ADMIN_BOT) ? config.ADMIN_BOT : []),
			...(Array.isArray(config?.devUsers) ? config.devUsers : []),
			...(Array.isArray(config?.DEV_USERS) ? config.DEV_USERS : [])
		].map(String);
		const rawAdmins = threadData?.adminIDs || threadData?.adminIds || threadData?.admin_ids || [];
		const threadAdmins = (Array.isArray(rawAdmins) ? rawAdmins : []).map(admin =>
			String(typeof admin === "object" ? (admin.id || admin.userID || admin.pk || admin.uid || "") : admin)
		);
		const isDM = event.isGroup === false || event.isGroup == null;
		const authorised =
			(configuredAdmins.includes(senderID) || threadAdmins.includes(senderID)) || // admin react → remove bot msg
			(isDM && senderID === String(eventThreadID));                                // DM participant
		if (!authorised) return;

		try {
			await new Promise((resolve, reject) => {
				client.unsendMessage(targetID, eventThreadID, (error, result) =>
					error ? reject(error) : resolve(result)
				);
			});
			log.info("REACTION", `${senderID} removed bot message ${targetID} via reaction ${reaction}`);
		} catch (error) {
			log.warn("REACTION", `Could not remove ${targetID}: ${error?.message || error}`);
		}
	}
};
