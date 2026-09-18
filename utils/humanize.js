'use strict';

/**
 * utils/humanize.js
 *
 * Small helpers that make the bot's reply *timing* look human instead of
 * instant/robotic. This does NOT touch what Instagram sees at the network/
 * fingerprint level (that's handled by ica/src/utils/rateLimiter.js and
 * ica/src/utils/user-agents.js) — this is purely about pacing: how long the
 * bot "thinks" and "types" before a message shows up.
 *
 * Design goals:
 *  - Delay scales with reply length (a human typing 300 chars takes longer
 *    than one typing "ok").
 *  - Every delay has randomness (jitter) so two replies never take exactly
 *    the same time.
 *  - Occasionally add a longer "distracted" pause, since real humans don't
 *    respond at a perfectly consistent cadence.
 */

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Estimate how long a human would take to notice + type a reply.
 * @param {string} text - the outgoing message text
 * @param {object} [opts]
 * @param {number} [opts.minMs=600]   floor for "reading/reacting" time
 * @param {number} [opts.maxMs=4000]  ceiling so the bot never feels stuck
 * @param {number} [opts.msPerChar=35] avg human typing speed w/ variance
 * @param {number} [opts.distractedChance=0.08] chance of a longer pause
 */
function humanDelayMs(text, opts = {}) {
  const {
    minMs = 600,
    maxMs = 4000,
    msPerChar = 35,
    distractedChance = 0.08
  } = opts;

  const len = typeof text === 'string' ? text.length : String(text || '').length;

  // Base "typing time": length-proportional, with +/-30% jitter per call.
  const typingTime = len * msPerChar * randomBetween(0.7, 1.3);

  // "Reaction time" before typing even starts.
  const reactionTime = randomBetween(minMs, minMs + 900);

  let total = reactionTime + typingTime;

  // Occasionally simulate the user getting distracted mid-conversation.
  if (Math.random() < distractedChance) {
    total += randomBetween(2000, 6000);
  }

  return Math.max(minMs, Math.min(maxMs, Math.round(total)));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Show typing indicator, wait a human-plausible amount of time based on the
 * outgoing text, then stop the indicator. Call this right before sending.
 *
 * @param {object} messageCtx - the `message` context (has .typing()/.stopTyping()
 *   if available, or fall back to api.sendTypingIndicator style calls)
 * @param {string} text - the text about to be sent
 */
async function humanPause(messageCtx, text) {
  const delay = humanDelayMs(text);
  try {
    if (messageCtx && typeof messageCtx.typing === 'function') {
      await messageCtx.typing();
    }
  } catch (_) {
    // typing indicator is best-effort; never block the reply on it
  }
  await sleep(delay);
  return delay;
}

module.exports = { humanDelayMs, humanPause, sleep, randomBetween };
