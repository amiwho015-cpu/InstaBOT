"use strict";

const HAND_EMOJIS = [
	"✋", "👌", "👍", "👏", "🙌", "👐", "🤲", "🙏", "🗑️", "🗑"
];

module.exports = {
	config: {
		name: "unsend",
		aliases: ["u", "delete", "del"],
		author: "Neoaz 🐊",
		category: "utility",
		cooldown: 1,
		role: 0,
		description: { en: "Unsend a message: reply to any message and the bot removes it, or react with hand/trash emoji as admin" },
		usage: { en: "Reply to a message with {p}unsend or react with ✋/🗑️ to unsend" }
	},

	onStart: async function ({ message, event, api }) {
		const replied = event.messageReply || event.repliedMessage;
		if (!replied?.messageID) return;
		if (message && typeof message.unsend === "function") {
			await message.unsend(replied.messageID).catch(() => {});
		} else if (api && typeof api.unsendMessage === "function") {
			// Fallback for direct command invocation with a bare api (tests,
			// RPC bridge gaps).
			await new Promise(resolve => {
				try { api.unsendMessage(replied.messageID, event.threadID, () => resolve()); }
				catch (_) { resolve(); }
			});
		}
	},

	/**
	 * Reaction unsend: an authorised user reacting with a hand/trash emoji
	 * removes the targeted message. Instagram only lets the bot unsend its
	 * OWN messages, so the effective feature is "admin reacts → bot deletes
	 * its message".
	 *
	 * Authorisation (any one of):
	 *   - bot admin (injected isBotAdmin checker OR config.adminBot/devUsers)
	 *   - thread admin / DM participant (dispatcher-computed role >= 1)
	 * Ownership is enforced again inside apiWrapper/auth.js; here we only
	 * skip early when the cache proves the message is not the bot's.
	 */
	onReaction: async function ({ api, event, role, isBotAdmin, config }) {
		const reaction = typeof event?.reaction === "string"
			? event.reaction
			: event?.reaction?.emoji || event?.reaction_unicode;
		if (!reaction) return;
		if (event.reactionStatus === "deleted" || event.reaction_status === "deleted") return;
		if (!HAND_EMOJIS.some(emoji => reaction.includes(emoji))) return;

		const targetID = String(event.targetMessageID || event.target_message_id || event.messageID || "").trim();
		const threadID = event.threadID || event.thread_id;
		if (!targetID || !threadID) return;
		if (!api || typeof api.unsendMessage !== "function") return;

		// ── authorisation (self-computed, not just the passed role) ──
		const senderID = String(event.senderID || event.userID || "").trim();
		let authorised = false;
		if (senderID) {
			if (typeof isBotAdmin === "function") {
				try { authorised = isBotAdmin(senderID) === true; } catch (_) { authorised = false; }
			}
			if (!authorised && config) {
				const admins = [
					...(Array.isArray(config.adminBot) ? config.adminBot : []),
					...(Array.isArray(config.ADMIN_BOT) ? config.ADMIN_BOT : []),
					...(Array.isArray(config.devUsers) ? config.devUsers : []),
					...(Array.isArray(config.DEV_USERS) ? config.DEV_USERS : [])
				].map(String);
				authorised = admins.includes(senderID);
			}
			// role >= 1 covers thread admins and DM participants as computed
			// by the dispatcher's roleOf() at reaction time.
			if (!authorised && Number(role) >= 1) authorised = true;
		}
		if (!authorised) return;

		// ── ownership pre-check (bot can only unsend its own messages) ──
		let botID = "";
		try { botID = String((typeof api.getCurrentUserID === "function" && api.getCurrentUserID()) || "").trim(); } catch (_) { botID = ""; }
		const cached = global.recentMessages?.get?.(String(targetID));
		if (cached?.senderID && botID && String(cached.senderID) !== botID) return;

		try {
			await new Promise((resolve, reject) => {
				try {
					const result = api.unsendMessage(targetID, threadID, (error, res) => error ? reject(error) : resolve(res));
					if (result && typeof result.then === "function") result.then(resolve, reject);
				} catch (e) { reject(e); }
			});
		} catch (_) { /* refused (not bot's message / already gone) — stay silent */ }
	}
};
