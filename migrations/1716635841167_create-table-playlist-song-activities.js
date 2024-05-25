exports.up = (pgm) => {
  pgm.createTable('playlist_song_activity', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"playlist"',
      onDelete: 'cascade',
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"song"',
      onDelete: 'cascade',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"user"',
      onDelete: 'cascade',
    },
    action: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    time: {
      type: 'TEXT',
      notNull: true,
    },
  });

  pgm.createIndex('playlist_song_activity', ['playlist_id', 'song_id', 'user_id']);
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_song_activity');
};
