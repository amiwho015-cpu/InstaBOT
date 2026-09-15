"use strict";

/**
 * commands/spin.js
 *
 * Wheel of fortune spin mini-game.
 * Adapted from Floppa-Chatbot.
 */

const WHEEL = [
	{ text: "💥 $0 (Bust)", multiplier: 0 },
	{ text: "🪙 0.5x Bet", multiplier: 0.5 },
	{ text: "⚡ 1.2x Bet", multiplier: 1.2 },
	{ text: "🎯 1.5x Bet", multiplier: 1.5 },
	{ text: "🔥 2x Bet (Double!)", multiplier: 2.0 },
	{ text: "🌟 3x Bet (Triple!)", multiplier: 3.0 },
	{ text: "💎 5x Bet (Jackpot!)", multiplier: 5.0 }
];

module.exports = {
	config: {
		name: "spin",
		aliases: ["wheel", "luckyspin"],
		author: "frnAlt",
		category: "economy",
		cooldown: 5,
		role: 0,
		shortDescription: { en: "Spin the wheel of fortune" },
		longDescription: { en: "Bet an amount and spin the wheel for prize multipliers." },
		guide: { en: "{pn} <bet amount>" }
	},

	onStart: async function ({ message, args, event, usersData, database }) {
		const bet = parseInt(args[0], 10);
		if (isNaN(bet) || bet <= 0) {
			return message.reply("💡 Usage: spin <bet amount>\nExample: spin 100");
		}

		let currentBalance = 0;
		if (usersData && typeof usersData.getMoney === "function") {
			currentBalance = await usersData.getMoney(event.senderID);
		} else if (database && typeof database.getBalance === "function") {
			currentBalance = (database.getBalance(event.senderID) || {}).balance || 0;
		}

		if (currentBalance < bet) {
			return message.reply(`❌ Insufficient funds! Your balance is $${currentBalance.toLocaleString()}.`);
		}

		// Deduct bet
		if (usersData && typeof usersData.subtractMoney === "function") {
			await usersData.subtractMoney(event.senderID, bet);
		} else if (database && typeof database.addBalance === "function") {
			await database.addBalance(event.senderID, -bet);
		}

		const outcome = WHEEL[Math.floor(Math.random() * WHEEL.length)];
		const winnings = Math.round(bet * outcome.multiplier);
		const net = winnings - bet;

		if (winnings > 0) {
			if (usersData && typeof usersData.addMoney === "function") {
				await usersData.addMoney(event.senderID, winnings);
			} else if (database && typeof database.addBalance === "function") {
				await database.addBalance(event.senderID, winnings);
			}
		}

		let resultMsg = `🎡 THE WHEEL SPINS... 🎡\n\n`;
		resultMsg += `🎯 Landed on: ${outcome.text}\n`;
		resultMsg += `💵 Bet Amount: $${bet.toLocaleString()}\n`;
		if (net > 0) {
			resultMsg += `🎉 Net Profit : +$${net.toLocaleString()}!`;
		} else if (net < 0) {
			resultMsg += `😢 Net Loss   : -$${Math.abs(net).toLocaleString()}`;
		} else {
			resultMsg += `⚖️ Broke even!`;
		}

		return message.reply(resultMsg);
	}
};
