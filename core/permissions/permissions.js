"use strict";

/**
 * core/permissions/permissions.js
 *
 * Role Hierarchy:
 *   0: Member (default user)
 *   1: Thread Admin / Group Moderator
 *   2: Bot Admin (config.ADMIN_BOT)
 *   3: Bot Owner / Developer (config.DEV_USERS)
 */

class Permissions {
	constructor(config) {
		this.config = config;
		this.adminBot = (config.ADMIN_BOT || []).map(String);
		this.devUsers = (config.DEV_USERS || []).map(String);
	}

	getUserRole(userID, threadID, threadData = null) {
		const uid = String(userID || "");
		if (!uid) return 0;

		// 1. Bot Owner / Developer
		if (this.devUsers.includes(uid)) {
			return 3;
		}

		// 2. Bot Admin
		if (this.adminBot.includes(uid)) {
			return 2;
		}

		// 3. Thread Admin / Group Moderator
		if (threadData) {
			const adminIDs = (threadData.adminIDs || threadData.adminIds || []).map(a => String(a.id || a.userID || a));
			if (adminIDs.includes(uid)) {
				return 1;
			}
		}

		// 4. Default user
		return 0;
	}

	hasPermission(roleRequired, userRole) {
		const required = Number(roleRequired) || 0;
		const current = Number(userRole) || 0;
		return current >= required;
	}

	getRoleName(role) {
		switch (Number(role)) {
			case 3: return "Bot Owner";
			case 2: return "Bot Admin";
			case 1: return "Thread Admin";
			default: return "User";
		}
	}
}

function getPermissionLevel(userID, threadAdmins = [], config = {}) {
	const p = new Permissions(config);
	return p.getUserRole(userID, null, { adminIDs: threadAdmins });
}

function checkPermission(userRole, roleRequired) {
	return (Number(userRole) || 0) >= (Number(roleRequired) || 0);
}

module.exports = { Permissions, getPermissionLevel, checkPermission };
