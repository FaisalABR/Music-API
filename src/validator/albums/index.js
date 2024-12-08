const InvariantError = require("../../exceptions/InvariantError");
const { AlbumsPayloadSchema, AlbumCoverSchema } = require("./schema");

const AlbumValidator = {
	validateAlbumPayload: (payload) => {
		const validationResult = AlbumsPayloadSchema.validate(payload);

		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},

	validateAlbumCoverPayload: (payload) => {
		const validationResult = AlbumCoverSchema.validate(payload);

		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
};

module.exports = AlbumValidator;
