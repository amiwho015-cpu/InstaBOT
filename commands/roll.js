"use strict";

/**
 * commands/roll.js
 *
 * Dice roll mini-game.
 * Adapted from Floppa-Chatbot.
 */

module.exports = {
	config: {
		name: "roll",
		aliases: ["dicegame"],
		author: "frnAlt",
		category: "fun",
		cooldown: 3,
		role: 0,
		shortDescription: { en: "Roll dice against the bot" },
		longDescription: { en: "Rolls a 6-sided die against the bot or optionally bets an amount." },
		guide: { en: "{pn} [bet amount]" }
	},

	onStart: async function ({ message, args, event, usersData, database }) {
		const userRoll = Math.floor(Math.random() * 6) + 1;
		const botRoll = Math.floor(Math.random() * 6) + 1;
		const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

		const bet = parseInt(args[0], 10);
		const isBetting = !isNaN(bet) && bet > 0;

		if (isBetting) {
			let currentBalance = 0;
			if (usersData && typeof usersData.getMoney === "function") {
				currentBalance = await usersData.getMoney(event.senderID);
			} else if (database && typeof database.getBalance === "function") {
				currentBalance = (database.getBalance(event.senderID) || {}).balance || 0;
			}

			if (currentBalance < bet) {
				return message.reply(`❌ Insufficient funds! You have $${currentBalance.toLocaleString()}.`);
			}

			if (usersData && typeof usersData.subtractMoney === "function") {
				await usersData.subtractMoney(event.senderID, bet);
			} else if (database && typeof database.addBalance === "function") {
				await database.addBalance(event.senderID, -bet);
			}
		}

		let msg = `🎲 DICE ROLL 🎲\n\n`;
		msg += `👤 Your Roll : ${diceEmojis[userRoll - 1]} (${userRoll})\n`;
		msg += `🤖 Bot's Roll: ${diceEmojis[botRoll - 1]} (${botRoll})\n\n`;

		if (userRoll > botRoll) {
			msg += `🎉 You Win!`;
			if (isBetting) {
				const reward = bet * 2;
				if (usersData && typeof usersData.addMoney === "function") {
					await usersData.addMoney(event.senderID, reward);
				} else if (database && typeof database.addBalance === "function") {
					await database.addBalance(event.senderID, reward);
				}
				msg += ` You won +$${bet.toLocaleString()}!`;
			}
		} else if (userRoll < botRoll) {
			msg += `😢 Bot Wins!`;
			if (isBetting) {
				msg += ` You lost $${bet.toLocaleString()}.`;
			}
		} else {
			msg += `⚖️ It's a Tie!`;
			if (isBetting) {
				if (usersData && typeof usersData.addMoney === "function") {
					await usersData.addMoney(event.senderID, bet);
				} else if (database && typeof database.addBalance === "function") {
					await database.addBalance(event.senderID, bet);
				}
				msg += ` Your bet was refunded.`;
			}
		}

		return message.reply(msg);
	}
};
