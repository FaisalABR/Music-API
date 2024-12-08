class PlaylistHandler {
	constructor(playlistService, songService, validator) {
		this._playlistService = playlistService;
		this._songService = songService;
		this._validator = validator;

		this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
		this.getPlaylistHandler = this.getPlaylistHandler.bind(this);
		this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);

		this.getPlaylistSongByIdHandler =
			this.getPlaylistSongByIdHandler.bind(this);
		this.postPlaylistSongByIdHandler =
			this.postPlaylistSongByIdHandler.bind(this);
		this.getPlaylistActivitiesByIdHandler =
			this.getPlaylistActivitiesByIdHandler.bind(this);
		this.deletePlaylistSongsByIdHandler =
			this.deletePlaylistSongsByIdHandler.bind(this);
	}

	async postPlaylistHandler(request, h) {
		this._validator.validatePlaylistPayload(request.payload);

		const { name } = request.payload;
		const { id: credentialId } = request.auth.credentials;

		const playlistId = await this._playlistService.addPlaylist(
			name,
			credentialId
		);

		const response = h.response({
			status: "success",
			data: {
				playlistId,
			},
		});
		response.code(201);
		return response;
	}

	async getPlaylistHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;

		const playlists = await this._playlistService.getPlaylists(credentialId);

		const response = h.response({
			status: "success",
			data: {
				playlists,
			},
		});
		return response;
	}

	async deletePlaylistByIdHandler(request, h) {
		const { id } = request.params;
		const { id: credentialId } = request.auth.credentials;

		await this._playlistService.verifyPlaylistOwner(id, credentialId);
		await this._playlistService.deletePlaylist(id);

		return h.response({
			status: "success",
			message: "Playlist berhasil dihapus",
		});
	}

	async postPlaylistSongByIdHandler(request, h) {
		this._validator.validateSongPlaylistPayload(request.payload);

		const { songId } = request.payload;
		const { id: playlistId } = request.params;
		const { id: credentialId } = request.auth.credentials;

		await this._songService.getDetailSong(songId);
		await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
		await this._playlistService.addSongToPlaylist(playlistId, songId);
		await this._playlistService.addActivity(
			playlistId,
			songId,
			credentialId,
			"add"
		);

		const response = h.response({
			status: "success",
			message: "Songs berhasil ditambahkan ke dalam playlist",
		});
		response.code(201);
		return response;
	}

	async getPlaylistSongByIdHandler(request, h) {
		const { id } = request.params;
		const { id: credentialId } = request.auth.credentials;
		const playlist = await this._playlistService.getPlaylistSongById(
			id,
			credentialId
		);

		return {
			status: "success",
			data: {
				playlist,
			},
		};
	}

	async deletePlaylistSongsByIdHandler(request, h) {
		this._validator.validateSongPlaylistPayload(request.payload);

		const { id } = request.params;
		const { songId } = request.payload;
		const { id: credentialId } = request.auth.credentials;

		await this._playlistService.verifyPlaylistAccess(id, credentialId);
		await this._playlistService.deleteSongFromPlaylist(id, songId);
		await this._playlistService.addActivity(id, songId, credentialId, "delete");

		return {
			status: "success",
			message: "Song berhasil dihapus dari playlist",
		};
	}

	async getPlaylistActivitiesByIdHandler(request, h) {
		const { id } = request.params;
		const { id: credentialId } = request.auth.credentials;

		await this._playlistService.verifyPlaylistAccess(id, credentialId);

		const activities = await this._playlistService.getPlaylistActivitiesById(
			id
		);

		return {
			status: "success",
			data: {
				playlistId: id,
				activities,
			},
		};
	}
}

module.exports = PlaylistHandler;
