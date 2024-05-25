// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const song = require('./api/song');
const album = require('./api/album');
const user = require('./api/user');

const SongService = require('./services/postgres/SongService');
const AlbumService = require('./services/postgres/AlbumService');
const UserService = require('./services/postgres/UserService');

const AlbumsValidator = require('./validator/album');
const SongsValidator = require('./validator/song');
const UserValidator = require('./validator/user');

const { ClientError } = require('./exceptions/ClientError');

const init = async () => {
  const songService = new SongService();
  const albumService = new AlbumService();
  const userService = new UserService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: song,
    options: {
      service: songService,
      validator: SongsValidator,
    },
  });
  await server.register({
    plugin: album,
    options: {
      service: albumService,
      validator: AlbumsValidator,
    },
  });
  await server.register([
    {
      plugin: user,
      options: {
        service: userService,
        validator: UserValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });

        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'There is error on server',
      });

      newResponse.code(500);
      return newResponse;
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
