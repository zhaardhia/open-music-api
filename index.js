// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const song = require('./api/song');
const album = require('./api/album');
const user = require('./api/user');
const authentication = require('./api/authentication');
const playlist = require('./api/playlist');
const playlistSong = require('./api/playlist-song');
const playlistSongActivity = require('./api/playlist-song-activity');
const collaboration = require('./api/collaboration');
const _exports = require('./api/exports');
const uploads = require('./api/upload');
const userAlbumLikes = require('./api/userAlbumLikes');

const SongService = require('./services/postgres/SongService');
const AlbumService = require('./services/postgres/AlbumService');
const UserService = require('./services/postgres/UserService');
const AuthenticationsService = require('./services/postgres/AuthenticationService');
const PlaylistService = require('./services/postgres/PlaylistService');
const PlaylistSongService = require('./services/postgres/PlaylistSongService');
const PlaylistSongActivityService = require('./services/postgres/PlaylistSongActivityService');
const CollaborationService = require('./services/postgres/CollaborationService');
const ProducerService = require('./services/rabbitmq/ProducerService');
const StorageService = require('./services/storage/StorageService');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikesService');
const CacheService = require('./services/redis/CacheService');

const AlbumsValidator = require('./validator/album');
const SongsValidator = require('./validator/song');
const UserValidator = require('./validator/user');
const AuthenticationsValidator = require('./validator/authentication');
const PlaylistValidator = require('./validator/playlist');
const PlaylistSongsValidator = require('./validator/playlist-song');
const CollaborationValidator = require('./validator/collaboration');
const ExportsValidator = require('./validator/exports');
const UploadsValidator = require('./validator/uploads');

const TokenManager = require('./tokenize/TokenManager');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const collaborationService = new CollaborationService();
  const songService = new SongService();
  const albumService = new AlbumService();
  const userService = new UserService();
  const authenticationService = new AuthenticationsService();
  const playlistService = new PlaylistService(collaborationService);
  const playlistSongService = new PlaylistSongService();
  const playlistSongActivityService = new PlaylistSongActivityService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/upload/file/cover'));
  const cacheService = new CacheService();
  const userAlbumLikesService = new UserAlbumLikesService(cacheService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
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

  server.auth.strategy('openmusic_jwt', 'jwt', {
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
      plugin: song,
      options: {
        service: songService,
        validator: SongsValidator,
      },
    },
    {
      plugin: album,
      options: {
        service: albumService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: user,
      options: {
        service: userService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentication,
      options: {
        authenticationsService: authenticationService,
        usersService: userService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: playlistSong,
      options: {
        playlistService,
        songsService: songService,
        playlistSongService,
        playlistSongsActivitiesService: playlistSongActivityService,
        validator: PlaylistSongsValidator,
      },
    },
    {
      plugin: playlistSongActivity,
      options: {
        playlistService,
        playlistSongsActivitiesService: playlistSongActivityService,
      },
    },
    {
      plugin: collaboration,
      options: {
        collaborationsService: collaborationService,
        playlistService,
        usersService: userService,
        validator: CollaborationValidator,
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
      plugin: uploads,
      options: {
        storageService,
        albumService,
        validator: UploadsValidator,
      },
    },
    {
      plugin: userAlbumLikes,
      options: {
        userAlbumLikesService,
        albumService,
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
