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
	pgm.createTable("playlist_song_activities", {
		id: {
			type: "VARCHAR(32)",
			primaryKey: true,
		},
		playlist_id: {
			type: "VARCHAR(32)",
			references: '"playlists"',
			onDelete: "cascade",
		},
		song_id: {
			type: "VARCHAR(32)",
			notNull: true,
		},
		user_id: {
			type: "VARCHAR(32)",
			notNull: true,
		},
		action: {
			type: "VARCHAR(32)",
			notNull: true,
		},
		time: {
			type: "TEXT",
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
	pgm.dropTable("playlist_song_activities");
};
