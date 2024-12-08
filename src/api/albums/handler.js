class AlbumsHandler {
	constructor(service, storageService, validator) {
		this._service = service;
		this._storageService = storageService;
		this._validator = validator;

		this.postAlbumsHandler = this.postAlbumsHandler.bind(this);
		this.getAlbumsByIdHandler = this.getAlbumsByIdHandler.bind(this);
		this.putAlbumsByIdHandler = this.putAlbumsByIdHandler.bind(this);
		this.deleteAlbumsByIdHandler = this.deleteAlbumsByIdHandler.bind(this);
		this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
		this.postLikeAlbumByIdHandler = this.postLikeAlbumByIdHandler.bind(this);
		this.getAlbumLikesByIdHandler = this.getAlbumLikesByIdHandler.bind(this);
		this.deleteAlbumLikesByIdHandler =
			this.deleteAlbumLikesByIdHandler.bind(this);
	}

	async postAlbumsHandler(request, h) {
		this._validator.validateAlbumPayload(request.payload);
		const { name, year } = request.payload;

		const albumId = await this._service.addAlbum({ name, year });

		const response = h.response({
			status: "success",
			message: "Menambahkan album",
			data: {
				albumId,
			},
		});
		response.code(201);
		return response;
	}

	async getAlbumsByIdHandler(request) {
		const { id } = request.params;

		const album = await this._service.getAlbumById(id);
		return {
			status: "success",
			data: {
				album,
			},
		};
	}

	async putAlbumsByIdHandler(request) {
		this._validator.validateAlbumPayload(request.payload);

		const { id } = request.params;

		await this._service.editAlbum(id, request.payload);

		return {
			status: "success",
			message: "Album berhasil diperbarui",
		};
	}

	async deleteAlbumsByIdHandler(request) {
		const { id } = request.params;

		await this._service.deleteAlbum(id);

		return {
			status: "success",
			message: "Album berhasil dihapus",
		};
	}

	async postAlbumCoverHandler(request, h) {
		const { id } = request.params;
		const { cover } = request.payload;

		this._validator.validateAlbumCoverPayload(cover.hapi.headers);

		const filename = await this._storageService.writeFile(cover, cover.hapi);
		const path = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
		await this._service.editAlbumCoverById(path, id);

		const response = h.response({
			status: "success",
			message: "Sampul berhasil diunggah",
		});
		response.code(201);
		return response;
	}

	async postLikeAlbumByIdHandler(request, h) {
		const { id: albumId } = request.params;
		const { id: userId } = request.auth.credentials;

		await this._service.getAlbumById(albumId);
		await this._service.addAlbumLikeById(albumId, userId);

		const response = h.response({
			status: "success",
			message: "Operasi berhasil dilakukan",
		});
		response.code(201);
		return response;
	}

	async getAlbumLikesByIdHandler(request, h) {
		const { id } = request.params;
		const { cache, likes } = await this._service.getAlbumLikesById(id);

		const response = h.response({
			status: "success",
			data: {
				likes,
			},
		});

		if (cache) response.header("X-Data-Source", "cache");

		return response;
	}

	async deleteAlbumLikesByIdHandler(request, h) {
		const { id: albumId } = request.params;
		const { id: userId } = request.auth.credentials;

		await this._service.deleteAlbumLikeById(albumId, userId);

		const response = h.response({
			status: "success",
			message: "Membatalkan like album",
		});

		return response;
	}
}

module.exports = AlbumsHandler;
