exports.up = (pgm) => {
	pgm.createTable("album_user_like", {
		id: {
			type: "VARCHAR(32)",
			primaryKey: true,
		},
		user_id: {
			type: "VARCHAR(32)",
			notNull: true,
			references: '"users"',
			onDelete: "cascade",
		},
		album_id: {
			type: "VARCHAR(50)",
			notNull: true,
			references: '"albums"',
			onDelete: "cascade",
		},
	});
};

exports.down = (pgm) => {
	pgm.dropTable("album_user_like");
};
