class ExportsHandler {
	constructor(producerService, playlistService, validator) {
		this._producerService = producerService;
		this._playlistService = playlistService;
		this._validator = validator;

		this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
	}

	async postExportPlaylistHandler(request, h) {
		this._validator.validateExportsPayload(request.payload);

		const { id: userId } = request.auth.credentials;
		const { playlistId } = request.params;

		await this._playlistService.verifyPlaylistOwner(playlistId, userId);

		const message = {
			playlistId,
			targetEmail: request.payload.targetEmail,
		};

		await this._producerService.sendMessage(
			"export:playlists",
			JSON.stringify(message)
		);

		const response = h.response({
			status: "success",
			message: "Permintaan Anda sedang kami proses",
		});
		response.code(201);
		return response;
	}
}

module.exports = ExportsHandler;
