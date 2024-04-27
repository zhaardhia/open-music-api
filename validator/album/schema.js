const Joi = require('joi');

const currentYear = new Date().getFullYear();
module.exports.AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1800).max(currentYear)
    .required(),
});
