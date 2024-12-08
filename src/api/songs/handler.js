class SongsHandler {
	constructor(service, validator) {
		this._service = service;
		this._validator = validator;

		this.postSongHandler = this.postSongHandler.bind(this);
		this.getSongsHandler = this.getSongsHandler.bind(this);
		this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
		this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
		this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
	}

	async postSongHandler(request, h) {
		this._validator.validateSongPayload(request.payload);
		const { title, year, genre, performer, duration, albumId } =
			request.payload;

		const songId = await this._service.addSong({
			title,
			year,
			genre,
			performer,
			duration,
			albumId,
		});

		const response = h.response({
			status: "success",
			message: "Menambahkan song",
			data: {
				songId,
			},
		});
		response.code(201);
		return response;
	}

	async getSongsHandler(request, h) {
		try {
			const { title = null, performer = null } = request.query;
			const songs = await this._service.getSongs(title, performer);

			const response = h.response({
				status: "success",
				data: {
					songs,
				},
			});

			return response;
		} catch (error) {
			return h.response({
				status: "fail",
				code: 500,
				message: "Terjadi kesalahan pada server",
			});
		}
	}

	async getSongByIdHandler(request, h) {
		const { id } = request.params;

		const song = await this._service.getDetailSong(id);

		return h.response({
			status: "success",
			code: 200,
			data: {
				song,
			},
		});
	}

	async putSongByIdHandler(request) {
		this._validator.validateSongPayload(request.payload);

		const { id } = request.params;

		await this._service.editSong(id, request.payload);

		return {
			status: "success",
			message: "Song berhasil diperbarui",
		};
	}

	async deleteSongByIdHandler(request) {
		const { id } = request.params;

		await this._service.deleteSong(id);

		return {
			status: "success",
			message: "Song berhasil dihapus",
		};
	}
}

module.exports = SongsHandler;
