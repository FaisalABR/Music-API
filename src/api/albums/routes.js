const path = require("path");

const routes = (handler) => [
	{
		method: "POST",
		path: "/albums",
		handler: handler.postAlbumsHandler,
	},
	{
		method: "GET",
		path: "/albums/{id}",
		handler: handler.getAlbumsByIdHandler,
	},
	{
		method: "PUT",
		path: "/albums/{id}",
		handler: handler.putAlbumsByIdHandler,
	},
	{
		method: "DELETE",
		path: "/albums/{id}",
		handler: handler.deleteAlbumsByIdHandler,
	},
	{
		method: "POST",
		path: "/albums/{id}/covers",
		handler: handler.postAlbumCoverHandler,
		options: {
			payload: {
				allow: "multipart/form-data",
				multipart: true,
				output: "stream",
				maxBytes: 512000,
			},
		},
	},
	{
		method: "GET",
		path: "/upload/images/{param*}",
		handler: {
			directory: {
				path: path.join(__dirname, "/file/images/album_cover/"),
			},
		},
	},
	{
		method: "POST",
		path: "/albums/{id}/likes",
		handler: handler.postLikeAlbumByIdHandler,
		options: {
			auth: "openmusic_jwt",
		},
	},
	{
		method: "GET",
		path: "/albums/{id}/likes",
		handler: handler.getAlbumLikesByIdHandler,
	},
	{
		method: "DELETE",
		path: "/albums/{id}/likes",
		handler: handler.deleteAlbumLikesByIdHandler,
		options: {
			auth: "openmusic_jwt",
		},
	},
];

module.exports = routes;
