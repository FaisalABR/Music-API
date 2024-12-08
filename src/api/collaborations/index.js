const CollaborationsHandler = require("./handler");
const routes = require("./routes");

const collaborationsPlugin = {
	name: "collaborations",
	version: "1.0.0",
	register: async (
		server,
		{ collaborationsService, playlistService, usersService, validator }
	) => {
		const collaborationHandler = new CollaborationsHandler(
			collaborationsService,
			playlistService,
			usersService,
			validator
		);
		server.route(routes(collaborationHandler));
	},
};

module.exports = collaborationsPlugin;
