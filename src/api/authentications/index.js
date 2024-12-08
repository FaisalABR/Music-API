const AuthenticationsHandler = require("./handler");
const routes = require("./routes");

const authenticationsPlugin = {
	name: "authentications",
	version: "1.0.0",
	register: async (
		server,
		{ authenticationsService, usersService, tokenManager, validator }
	) => {
		const authenticationsHandler = new AuthenticationsHandler(
			authenticationsService,
			usersService,
			tokenManager,
			validator
		);

		server.route(routes(authenticationsHandler));
	},
};
module.exports = authenticationsPlugin;
