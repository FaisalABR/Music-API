const Joi = require("joi");

const PostAuthenticationsPayloadScheme = Joi.object({
	username: Joi.string().required(),
	password: Joi.string().required(),
});

const PutAuthenticationsPayloadScheme = Joi.object({
	refreshToken: Joi.string().required(),
});

const DeleteAuthenticationsPayloadScheme = Joi.object({
	refreshToken: Joi.string().required(),
});

module.exports = {
	PostAuthenticationsPayloadScheme,
	PutAuthenticationsPayloadScheme,
	DeleteAuthenticationsPayloadScheme,
};
