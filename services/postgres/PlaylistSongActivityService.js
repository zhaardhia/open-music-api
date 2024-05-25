const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class PlaylistSongsActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSongActivities(playlistId, {
    songId, userId, action, time,
  }) {
    const id = `activity-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song_activity VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };

    await this._pool.query(query);
  }

  async getPlaylistSongActivities(playlistId) {
    const query = {
      text: `SELECT u.username, s.title, psa.action, psa.time FROM playlist_song_activity psa
        LEFT JOIN "user" u ON u.id = psa.user_id
        LEFT JOIN song s ON s.id = psa.song_id
        WHERE psa.playlist_id = $1
        ORDER BY psa.action`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    result.rows = result.rows.sort((a, b) => new Date(a.time) - new Date(b.time));
    return {
      playlistId, activities: result.rows,
    };
  }
}

module.exports = PlaylistSongsActivitiesService;
