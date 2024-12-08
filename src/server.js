require("dotenv").config();
const Hapi = require("@hapi/hapi");
const ClientError = require("./exceptions/ClientError");
const TokenManager = require("./tokenize/TokenManager");
const Jwt = require("@hapi/jwt");
const path = require("path");

const albums = require("./api/albums");
const AlbumService = require("./services/postgres/AlbumsService");
const AlbumValidator = require("./validator/albums");

const songs = require("./api/songs");
const SongService = require("./services/postgres/SongService");
const SongValidator = require("./validator/songs");

const users = require("./api/users");
const UsersValidator = require("./validator/users");
const UsersService = require("./services/postgres/UsersService");

const playlists = require("./api/playlist");
const PlaylistService = require("./services/postgres/PlaylistService");
const PlaylistValidator = require("./validator/playlists");

const authentications = require("./api/authentications");
const AuthenticationsValidator = require("./validator/authentications");
const AuthenticationsService = require("./services/postgres/AuthenticationsService");

const collaborations = require("./api/collaborations");
const CollaborationsValidator = require("./validator/collaborations");
const CollaborationsService = require("./services/postgres/CollaborationsService");

const _exports = require("./api/exports");
const ExportsValidator = require("./validator/exports");
const ProducerService = require("./services/rabbitmq/ProducerService");
const StorageService = require("./services/storage/StorageService");
const CacheService = require("./services/redis/CacheService");
const Inert = require("@hapi/inert");

const init = async () => {
	const cacheService = new CacheService();
	const albumsService = new AlbumService(cacheService);
	const songService = new SongService();
	const usersService = new UsersService();
	const authenticationsService = new AuthenticationsService();
	const collaborationsService = new CollaborationsService();
	const playlistService = new PlaylistService(collaborationsService);
	const storageService = new StorageService(
		path.join(__dirname, "/api/albums/file/images/album_cover")
	);

	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.HOST,
		routes: {
			cors: {
				origin: ["*"],
			},
		},
	});

	await server.register([
		{
			plugin: Jwt,
		},
		{
			plugin: Inert,
		},
	]);

	server.ext("onPreResponse", (request, h) => {
		const { response } = request;

		if (response instanceof ClientError) {
			const newResponse = h.response({
				status: "fail",
				message: response.message,
			});
			newResponse.code(response.statusCode);
			return newResponse;
		}

		return h.continue;
	});

	server.auth.strategy("openmusic_jwt", "jwt", {
		keys: process.env.ACCESS_TOKEN_KEY,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: process.env.ACCESS_TOKEN_AGE,
		},
		validate: (artifacts) => ({
			isValid: true,
			credentials: {
				id: artifacts.decoded.payload.id,
			},
		}),
	});

	await server.register([
		{
			plugin: songs,
			options: {
				service: songService,
				validator: SongValidator,
			},
		},
		{
			plugin: albums,
			options: {
				service: albumsService,
				storageService,
				validator: AlbumValidator,
			},
		},
		{
			plugin: users,
			options: {
				service: usersService,
				validator: UsersValidator,
			},
		},
		{
			plugin: authentications,
			options: {
				authenticationsService,
				usersService,
				tokenManager: TokenManager,
				validator: AuthenticationsValidator,
			},
		},
		{
			plugin: playlists,
			options: {
				playlistService,
				songService,
				validator: PlaylistValidator,
			},
		},
		{
			plugin: _exports,
			options: {
				producerService: ProducerService,
				playlistService,
				validator: ExportsValidator,
			},
		},
		{
			plugin: collaborations,
			options: {
				collaborationsService,
				playlistService,
				usersService,
				validator: CollaborationsValidator,
			},
		},
	]);

	await server.start();

	console.log(`Running on ${server.info.uri}`);
};

init();
