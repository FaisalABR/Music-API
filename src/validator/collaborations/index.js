const InvariantError = require("../../exceptions/InvariantError");
const CollaborationsPayloadScheme = require("./schema");

const CollaborationsValidator = {
	validateCollaborationPayload: (payload) => {
		const validationResult = CollaborationsPayloadScheme.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
};

module.exports = CollaborationsValidator;
