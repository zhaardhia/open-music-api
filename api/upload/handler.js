class UploadsHandler {
  constructor(storageService, albumService, validator) {
    this._storageService = storageService;
    this._albumService = albumService;
    this._validator = validator;

    this.postUploadCoverAlbumImageHandler = this.postUploadCoverAlbumImageHandler.bind(this);
  }

  async postUploadCoverAlbumImageHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/${id}/cover/${filename}`;

    await this._albumService.updateAlbumCover(id, coverUrl);
    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
