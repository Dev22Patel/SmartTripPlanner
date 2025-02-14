const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json({ error: errorMessage });
  }
  next();
};

module.exports = validate;
