const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const { mapDBToModelSong } = require("../../utils");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongService {
	constructor() {
		this._pool = new Pool();
	}

	async addSong({ title, genre, year, performer, duration, albumId }) {
		const id = nanoid(16);
		const createdAt = new Date().toISOString();
		const updatedAt = createdAt;

		const query = {
			text: "INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
			values: [
				id,
				title,
				year,
				genre,
				performer,
				duration,
				albumId,
				createdAt,
				updatedAt,
			],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new Error("Songs gagal ditambahkan");
		}

		return result.rows[0].id;
	}

	async getSongs(title, performer) {
		let text = "SELECT id, title, performer FROM songs";
		const values = [];

		if (title) {
			text = text + " WHERE title ILIKE '%' || $1 || '%'";
			values.push(title);
		}

		if (!title && performer) {
			text = text + " WHERE performer ILIKE '%' || $1 || '%'";
			values.push(performer);
		}

		if (title && performer) {
			text = text + " AND performer ILIKE '%' || $2 || '%'";
			values.push(performer);
		}

		const query = {
			text: text,
			values: values,
		};

		const result = await this._pool.query(query);

		return result.rows;
	}

	async getDetailSong(id) {
		const query = {
			text: "SELECT * FROM songs WHERE id = $1",
			values: [id],
		};
		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError("Song tidak ditemukan");
		}

		return result.rows.map(mapDBToModelSong)[0];
	}

	async editSong(id, { title, year, genre, performer, duration }) {
		const updatedAt = new Date().toISOString();
		const query = {
			text: "UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id",
			values: [title, year, genre, performer, duration, updatedAt, id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError("Song tidak ditemukan");
		}

		return result.rows[0].id;
	}

	async deleteSong(id) {
		const query = {
			text: "DELETE FROM songs WHERE id = $1 RETURNING id",
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError("Songs gagal dihapus. Id tidak ditemukan");
		}
	}
}

module.exports = SongService;
