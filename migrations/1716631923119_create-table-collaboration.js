exports.up = (pgm) => {
  pgm.createTable('collaboration', {
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
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"user"',
      onDelete: 'cascade',
    },
  });

  pgm.createIndex('collaboration', ['playlist_id', 'user_id']);
};

exports.down = (pgm) => {
  pgm.dropTable('collaboration');
};
