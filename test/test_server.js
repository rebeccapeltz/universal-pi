'use strict';
const app = require('express')();
const mongoose = require('mongoose');
mongoose.promise = Promise;
const server = require('http').Server(app);
const io = require('socket.io')(server);

if (!process.env.APP_SECRET) process.env.APP_SECRET = 'shouldvegotoscar';

const errorHandler = require('../lib/error_handler.js');
const AppError = require('../lib/app_error.js');
const lirc = require('lirc_node');
lirc.init();

const userRouter = require('../route/user_router.js');

mongoose.connect('mongodb://localhost/dev_test');

app.use(errorHandler());

app.get('/api/update', (req, res, next) => {
  io.emit('update');
  res.status(200).send('Remotes updated to database.');
  next();
});

app.use('/api/remote/:name/:button', (req, res, next) => {
  console.log(req.params.name);
  if (!req.params.name) next(AppError.error400('Invalid remote name.'));
  if (!req.params.button) next(AppError.error400('Invalid button for specified remote.'));
  io.emit('post', [req.params.name, req.params.button]);
  res.status(200).send('sent ' + req.params.button + ' to ' + req.params.name + '.');
  next();
});

app.use('/api/user', userRouter);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).send(err.message || 'Database error.');
  next();
});

module.exports = exports = server;
