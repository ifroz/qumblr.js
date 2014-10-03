'use strict';
var qumblr = require('./src/index.js');
var config = require('./src/config');
var logger = require('node-log-demultiplexer')(
      config.get('logger')).
    createTracker('tumblrQueue');

var tumblrCredentials = {
  consumer_key: config.get('private:TUMBLR_APP_KEY'),
  consumer_secret: config.get('private:TUMBLR_APP_SECRET'),
  logger: logger
};

qumblr({ logger: logger }).listen({
  amqpCredentials: config.get('private:RABBITMQ_CREDENTIALS'),
  queueName: 'tumblr-queue',
  successQueueName: 'tumblr-queue-success',
  tumblrCredentials: tumblrCredentials
});