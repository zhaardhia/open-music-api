class UserAlbumLikesHandler {
  constructor(userAlbumLikesService, albumService) {
    this._userAlbumLikeService = userAlbumLikesService;
    this._albumService = albumService;

    this.postUserAlbumLikeHandler = this.postUserAlbumLikeHandler.bind(this);
    this.getUserAlbumLikeHandler = this.getUserAlbumLikeHandler.bind(this);
  }

  async postUserAlbumLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumService.getAlbumById(albumId);
    const alreadyLike = await this._userAlbumLikeService.verifyAlbumLike(credentialId, albumId);

    if (!alreadyLike) {
      await this._userAlbumLikeService.likeAlbum(credentialId, albumId);
    } else {
      const response = h.response({
        status: 'fail',
        message: 'Gagal like albums',
      });
      response.code(400);
      return response;
    }

    const response = h.response({
      status: 'success',
      message: 'Berhasil like albums',
    });
    response.code(201);
    return response;
  }

  async deleteUserAlbumUnlikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumService.getAlbumById(albumId);
    const alreadyLike = await this._userAlbumLikeService.verifyAlbumLike(credentialId, albumId);

    if (alreadyLike) {
      await this._userAlbumLikeService.unlikeAlbum(credentialId, albumId);
    } else {
      const response = h.response({
        status: 'fail',
        message: 'Gagal ulike albums',
      });
      response.code(400);
      return response;
    }

    const response = h.response({
      status: 'success',
      message: 'Berhasil unlike albums',
    });
    response.code(200);
    return response;
  }

  async getUserAlbumLikeHandler(request, h) {
    const { id } = request.params;

    await this._albumService.getAlbumById(id);

    const { likes, from } = await this._userAlbumLikeService.getAlbumLike(id);

    if (from === 'cache') {
      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });
      response.code(200);
      response.header('X-Data-Source', from);
      return response;
    }

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = UserAlbumLikesHandler;
