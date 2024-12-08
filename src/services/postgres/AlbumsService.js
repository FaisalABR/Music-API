const { nanoid } = require("nanoid");
const { Pool, Client } = require("pg");
const NotFoundError = require("../../exceptions/NotFoundError");
const InvariantError = require("../../exceptions/InvariantError");
const ClientError = require("../../exceptions/ClientError");

class AlbumService {
	constructor(cacheService) {
		this._pool = new Pool();
		this._cacheService = cacheService;
	}

	async addAlbum({ name, year }) {
		const id = nanoid(16);
		const createdAt = new Date().toISOString();
		const updatedAt = createdAt;

		const query = {
			text: "INSERT INTO albums VALUES ($1, $2, $3, $4, $5) RETURNING id",
			values: [id, name, year, createdAt, updatedAt],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new InvariantError("Album gagal ditambahkan");
		}

		return result.rows[0].id;
	}

	async getAlbumById(id) {
		const queryAlbum = {
			text: "SELECT * FROM albums WHERE id = $1",
			values: [id],
		};

		const querySongs = {
			text: "SELECT * FROM songs WHERE album_id = $1",
			values: [id],
		};

		const songResult = await this._pool.query(querySongs);
		const albumResult = await this._pool.query(queryAlbum);

		if (!albumResult.rows.length) {
			throw new NotFoundError("Album tidak ditemukan");
		}
		const album = albumResult.rows[0];
		console.log(album);

		const result = {
			id: album.id,
			name: album.name,
			year: album.year,
			coverUrl: album.cover,
			songs: songResult.rows,
		};

		return result;
	}

	async editAlbum(id, { name, year }) {
		const updatedAt = new Date().toISOString();
		const query = {
			text: "UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id",
			values: [name, year, updatedAt, id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError("Album tidak ditemukan");
		}
	}

	async deleteAlbum(id) {
		const query = {
			text: "DELETE FROM albums WHERE id = $1 RETURNING id",
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
		}
	}

	async editAlbumCoverById(path, id) {
		const query = {
			text: "UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id",
			values: [path, id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan.");
		}
	}

	async addAlbumLikeById(albumId, userId) {
		const id = `like-${nanoid(16)}`;

		const queryCheckLike = {
			text: "SELECT id FROM album_user_like WHERE user_id = $1 AND album_id = $2",
			values: [userId, albumId],
		};

		const queryCheckLikeResult = await this._pool.query(queryCheckLike);

		if (!queryCheckLikeResult.rows.length) {
			const queryLike = {
				text: "INSERT INTO album_user_like VALUES ($1, $2, $3) RETURNING id",
				values: [id, userId, albumId],
			};

			const queryLikeResult = await this._pool.query(queryLike);

			if (!queryLikeResult.rows[0].id) {
				throw new InvariantError("Gagal menambahkan like");
			}
		} else {
			throw new ClientError("Anda sudah melakukan like pada album ini", 400);
		}
	}

	async deleteAlbumLikeById(albumId, userId) {
		const key = `album-likes:${albumId}`;

		const queryDeleteLike = {
			text: "DELETE FROM album_user_like WHERE user_id = $1 AND album_id = $2 RETURNING id",
			values: [userId, albumId],
		};

		const result = await this._pool.query(queryDeleteLike);
		this._cacheService.delete(key);

		if (!result.rows.length) {
			throw new NotFoundError("Gagal menghapus like");
		}
	}

	async getAlbumLikesById(albumId) {
		try {
			const result = await this._cacheService.get(`album-likes:${albumId}`);
			const likes = parseInt(result);
			return {
				cache: true,
				likes,
			};
		} catch (error) {
			const query = {
				text: "SELECT COUNT(id) FROM album_user_like WHERE album_id = $1",
				values: [albumId],
			};

			const result = await this._pool.query(query);

			if (!result.rows.length) {
				throw new NotFoundError("Gagal mengambil like");
			}

			const likes = parseInt(result.rows[0].count);

			await this._cacheService.set(`album-likes:${albumId}`, likes, 1800);
			return {
				cache: false,
				likes,
			};
		}
	}
}

module.exports = AlbumService;
