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
	pgm.createTable("playlists", {
		id: {
			type: "VARCHAR(32)",
			primaryKey: true,
		},
		name: {
			type: "VARCHAR(64)",
			unique: true,
			notNull: true,
		},
		owner: {
			type: "VARCHAR(32)",
			references: '"users"',
			onDelete: "CASCADE",
		},
	});
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
	pgm.dropTable("playlists");
};
