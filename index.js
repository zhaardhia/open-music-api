// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const song = require('./api/song');
const album = require('./api/album');
const SongService = require('./services/postgres/SongService');
const AlbumService = require('./services/postgres/AlbumService');
// const NotesValidator = require('./validator/notes');

const init = async () => {
  const songService = new SongService();
  const albumService = new AlbumService();
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
      // validator: ,
    },
  });
  await server.register({
    plugin: album,
    options: {
      service: albumService,
      // validator: ,
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
