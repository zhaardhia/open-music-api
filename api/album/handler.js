const ClientError = require('../../exceptions/ClientError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  };

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const {name = 'untitled', year} = request.payload;
      const albumId = await this._service.addAlbum({name, year});

      const response = h.response({
        status: 'success',
        message: 'album added',
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(400);

        return response;
      };

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);

      return response;
    };
  };

  async getAlbumByIdHandler(request, h) {
    try {
      const {id} = request.params;
      const album = await this._service.getAlbumById(id);

      return {
        status: 'success',
        data: {
          album,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(404);

        return response;
      };

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);

      return response;
    };
  };

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const {id} = request.params;
      await this._service.editAlbumById(id, request.payload);

      return {
        status: 'success',
        message: 'Album Edited',
      };
    } catch (error) {
      if (error instanceof InvariantError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(400);

        return response;
      } else if (error instanceof NotFoundError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(404);

        return response;
      };

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);

      return response;
    };
  };
  async deleteAlbumByIdHandler(request, h) {
    try {
      const {id} = request.params;
      await this._service.deleteAlbumById(id);

      return {
        status: 'success',
        message: 'Album deleted',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(404);

        return response;
      };

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);

      return response;
    };
  };
};

module.exports = AlbumHandler;