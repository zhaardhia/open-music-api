const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: (request, h) => handler.getPlaylistSongActivities(request, h),
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
