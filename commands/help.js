"use strict";

/**
 * commands/help.js
 *
 * Advanced Floppa / GoatBot Interactive Command Navigation Engine:
 * - Paginated command directory with page navigation.
 * - Category summary and category filtering.
 * - Interactive onReply support (reply with page number or command name).
 * - Full command documentation extraction ({pn}, {p}, {n} placeholders).
 */

function extractCommandDetails(cmd, name, prefix) {
	const cfg = cmd.config || cmd.meta || {};
	const cmdName = cfg.name || name;
	const category = (cfg.category || "utility").toLowerCase();

	let description = "No description available";
	if (typeof cfg.shortDescription === "string" && cfg.shortDescription.trim()) {
		description = cfg.shortDescription.trim();
	} else if (typeof cfg.shortDescription?.en === "string") {
		description = cfg.shortDescription.en.trim();
	} else if (typeof cfg.description === "string" && cfg.description.trim()) {
		description = cfg.description.trim();
	} else if (typeof cfg.description?.en === "string") {
		description = cfg.description.en.trim();
	}

	let guide = "";
	if (typeof cfg.guide === "string" && cfg.guide.trim()) {
		guide = cfg.guide.trim();
	} else if (typeof cfg.guide?.en === "string") {
		guide = cfg.guide.en.trim();
	} else if (typeof cfg.usage === "string") {
		guide = cfg.usage.trim();
	} else if (typeof cfg.usage?.en === "string") {
		guide = cfg.usage.en.trim();
	}

	const replacePlaceholders = (text) => {
		if (!text) return text;
		return text
			.replace(/{pn}/g, `${prefix}${cmdName}`)
			.replace(/{p}{n}/g, `${prefix}${cmdName}`)
			.replace(/{prefix}{name}/g, `${prefix}${cmdName}`)
			.replace(/{p}/g, prefix)
			.replace(/{prefix}/g, prefix)
			.replace(/{n}/g, cmdName)
			.replace(/{name}/g, cmdName);
	};

	description = replacePlaceholders(description);
	guide = replacePlaceholders(guide || `${prefix}${cmdName}`);

	return {
		name: cmdName,
		aliases: Array.isArray(cfg.aliases) ? cfg.aliases : [],
		version: cfg.version || "1.0.0",
		author: cfg.author || "Unknown",
		role: cfg.role || 0,
		cooldown: cfg.countDown != null ? cfg.countDown : (cfg.cooldown || 0),
		category,
		description,
		guide
	};
}

function buildCommandDirectory(commands, prefix) {
	const list = [];
	const categories = {};

	for (const [key, cmd] of commands) {
		const cfg = cmd.config || cmd.meta || {};
		if (cfg.name && cfg.name.toLowerCase() !== key.toLowerCase()) continue;
		const details = extractCommandDetails(cmd, key, prefix);
		list.push(details);

		if (!categories[details.category]) categories[details.category] = [];
		categories[details.category].push(details);
	}

	list.sort((a, b) => a.name.localeCompare(b.name));
	return { list, categories };
}

function formatCommandDetail(c, prefix) {
	const roleNames = { 0: "User (Everyone)", 1: "Thread Admin", 2: "Bot Admin", 3: "Bot Owner" };
	let text = `╭─── [ 📌 COMMAND DETAILS ] ───╮\n`;
	text += `│ 🏷️ Name     : ${c.name}\n`;
	text += `│ 📁 Category : ${c.category.toUpperCase()}\n`;
	text += `│ 🎭 Role Req : ${roleNames[c.role] || c.role}\n`;
	text += `│ ⏱️ Cooldown : ${c.cooldown}s\n`;
	text += `│ 🔄 Aliases  : ${c.aliases.length ? c.aliases.join(", ") : "None"}\n`;
	text += `│ 👤 Author   : ${c.author}\n`;
	text += `╰──────────────────────────────╯\n\n`;
	text += `📖 Description:\n${c.description}\n\n`;
	text += `💡 Usage Guide:\n${c.guide}`;
	return text;
}

module.exports = {
	config: {
		name: "help",
		aliases: ["menu", "commands", "cmds", "h"],
		version: "7.2.0",
		author: "frnAlt",
		countDown: 2,
		role: 0,
		shortDescription: { en: "Interactive paginated command menu and guide" },
		longDescription: { en: "Displays categorized, paginated command lists and detailed manuals with reply-to-inspect support." },
		category: "system",
		guide: {
			en: "   {pn} [page]: View page of commands (e.g. {pn} 2)\n" +
				"   {pn} [command]: View manual for specific command\n" +
				"   {pn} cat [category]: Filter by category\n" +
				"   {pn} all: View category summary"
		}
	},

	onStart: async function ({ message, args, prefix, bot, event }) {
		const commandsMap = bot.commandLoader.commands;
		const { list, categories } = buildCommandDirectory(commandsMap, prefix);

		// 1. Specific command lookup
		if (args[0] && isNaN(args[0]) && !["all", "cat", "category"].includes(args[0].toLowerCase())) {
			const query = args[0].toLowerCase();

			// Check category match
			if (categories[query]) {
				const cmds = categories[query];
				let text = `╭─── [ 📁 CATEGORY: ${query.toUpperCase()} ] ───╮\n`;
				text += `│ Total: ${cmds.length} commands\n╰──────────────────────────────╯\n\n`;
				cmds.forEach(c => {
					text += `• ${prefix}${c.name} — ${c.description.slice(0, 45)}\n`;
				});
				text += `\n💡 Type ${prefix}help <command> for full instructions.`;
				return message.reply(text);
			}

			const found = list.find(c => c.name === query || c.aliases.map(a => a.toLowerCase()).includes(query));
			if (!found) {
				return message.reply(`❌ Command or category "${query}" not found. Type ${prefix}help to see all commands.`);
			}
			return message.reply(formatCommandDetail(found, prefix));
		}

		// 2. Category overview: !help all
		if (args[0]?.toLowerCase() === "all" || args[0]?.toLowerCase() === "category") {
			const sorted = Object.keys(categories).sort();
			let text = `╭─── [ 📚 COMMAND CATEGORIES ] ───╮\n`;
			text += `│ Total: ${list.length} commands across ${sorted.length} categories\n`;
			text += `╰─────────────────────────────────╯\n\n`;
			for (const cat of sorted) {
				text += `• ${cat.toUpperCase()} (${categories[cat].length} cmds)\n`;
			}
			text += `\n💡 Type ${prefix}help cat <name> to list commands in a category.\n`;
			text += `💡 Type ${prefix}help <name> to view command manual.`;
			return message.reply(text);
		}

		// 3. Filter category: !help cat <category>
		if (args[0]?.toLowerCase() === "cat" && args[1]) {
			const cat = args[1].toLowerCase();
			if (!categories[cat]) {
				return message.reply(`❌ Category "${cat}" not found. Type ${prefix}help all to see available categories.`);
			}
			const cmds = categories[cat];
			let text = `╭─── [ 📁 CATEGORY: ${cat.toUpperCase()} ] ───╮\n`;
			text += `│ Total: ${cmds.length} commands\n╰──────────────────────────────╯\n\n`;
			cmds.forEach(c => {
				text += `• ${prefix}${c.name} — ${c.description.slice(0, 45)}\n`;
			});
			text += `\n💡 Type ${prefix}help <command> for full instructions.`;
			return message.reply(text);
		}

		// 4. Paginated directory
		const perPage = 15;
		const totalPages = Math.ceil(list.length / perPage) || 1;
		let page = parseInt(args[0], 10) || 1;
		if (page < 1) page = 1;
		if (page > totalPages) page = totalPages;

		const start = (page - 1) * perPage;
		const pageItems = list.slice(start, start + perPage);

		let text = `╭─── [ 🤖 INSTABOT MENU (${page}/${totalPages}) ] ───╮\n`;
		text += `│ 🌐 Prefix: ${prefix} | Total: ${list.length} cmds\n`;
		text += `╰──────────────────────────────────────╯\n\n`;

		pageItems.forEach((c, idx) => {
			text += `${start + idx + 1}. ${prefix}${c.name} — ${c.description.slice(0, 40)}\n`;
		});

		text += `\n💬 Reply with page number (1-${totalPages}) or command name to inspect.`;

		const sent = await message.reply(text);

		if (global.GoatBot?.onReply && sent && sent.messageID) {
			global.GoatBot.onReply.set(String(sent.messageID), {
				commandName: "help",
				author: event.senderID,
				messageID: sent.messageID,
				currentPage: page,
				totalPages
			});
		}
	},

	onReply: async function ({ message, event, prefix, bot }) {
		const input = (event.body || "").trim();
		if (!input) return;

		// If input is a page number
		if (!isNaN(input)) {
			const pageNum = parseInt(input, 10);
			return module.exports.onStart({
				message,
				args: [String(pageNum)],
				prefix,
				bot,
				event
			});
		}

		// Otherwise treat as command query
		return module.exports.onStart({
			message,
			args: [input],
			prefix,
			bot,
			event
		});
	},

	// Backwards compatibility for run({ ... })
	run: async function (params) {
		return module.exports.onStart(params);
	}
};
