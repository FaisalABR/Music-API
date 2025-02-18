/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
	pgm.createTable("users", {
		id: {
			type: "VARCHAR(32)",
			primaryKey: true,
		},
		username: {
			type: "VARCHAR(64)",
			unique: true,
			notNull: true,
		},
		password: {
			type: "TEXT",
			notNull: true,
		},
		fullname: {
			type: "VARCHAR(255)",
			notNull: true,
		},
	});
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
	pgm.dropTable("users");
};
