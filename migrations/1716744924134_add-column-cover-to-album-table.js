exports.up = (pgm) => {
  pgm.addColumn('album', {
    cover: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('album', 'cover');
};
