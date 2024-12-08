const Joi = require("joi");

const AlbumsPayloadSchema = Joi.object({
	name: Joi.string().required(),
	year: Joi.number().required(),
});

const AlbumCoverSchema = Joi.object({
	"content-type": Joi.string()
		.valid(
			"image/apng",
			"image/avif",
			"image/gif",
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/jpg"
		)
		.required(),
}).unknown();

module.exports = { AlbumsPayloadSchema, AlbumCoverSchema };
