const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSong(playlistId, { songId }) {
    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist song gagal ditambahkan');
    }
  }

  async getPlaylistSong(playlistId) {
    const query = {
      text: `SELECT p.id, p.name, u.username 
        FROM playlist p 
        LEFT JOIN "user" u ON u.id = p.owner
        WHERE p.id = $1`,
      values: [playlistId],
    };

    let result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    const querySong = {
      text: `SELECT s.id, s.title, s.performer FROM playlist p 
        JOIN playlist_song ps ON  ps.playlist_id = p.id
        JOIN song s ON s.id = ps.song_id
        WHERE p.id = $1`,
      values: [playlistId],
    };

    result = await this._pool.query(querySong);

    playlist.songs = result.rows;

    return playlist;
  }

  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_song WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist song gagal dihapus, playlist id dan song id tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongsService;
