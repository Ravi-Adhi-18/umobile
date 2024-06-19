const Joi = require('joi');
const mysql = require('mysql2/promise');
const { registerUser, loginUser } = require('./handlers');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'umobile_task',
});

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.response({ message: 'health check' });
    }
  },
  {
    method: 'POST',
    path: '/register',
    options: {
      validate: {
        payload: Joi.object({
          username: Joi.string().min(3).required(),
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required(),
        }),
        failAction: (request, h, err) => {
          throw err;
        },
      },
    },
    handler: (request, h) => registerUser(request, h, pool),
  },
  {
    method: 'POST',
    path: '/login',
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required(),
        }),
        failAction: (request, h, err) => {
          throw err;
        },
      },
    },
    handler: (request, h) => loginUser(request, h, pool),
  },
];
