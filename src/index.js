'use strict';
var retry = require('amqp-retry');
var _ = require('lodash');

var tumblr, logger, amqp, callback;

var self = function(dependencies) {
  amqp = dependencies.amqp     || require('amqp');
  tumblr = dependencies.tumblr || require('tumblr-pool.js');
  logger = dependencies.logger || _(['info', 'debug', 'warning', 'error']).
      zipObject().mapValues(function(){ return _.noop; }).value();
  callback = dependencies.callback || _.noop;

  return {
    listen: function(options) {
      var mq = amqp.createConnection(options.amqpCredentials);
      mq.on('ready', function() {
        logger.debug('amqp is ready');

        var persistentQueue = {
          durable: true,
          mandatory: true,
          autoDelete: false
        };

        if (options.successQueueName) {
          mq.queue(options.successQueueName, persistentQueue);
        }
        mq.queue(options.queueName, persistentQueue, function(q) {
          logger.debug('queue "' + options.queueName + '" is open.');
          var qHandler = function(err, task, headers, deliveryInfo, job) {
            if (options.logger && _.isEmpty(options.logger)) {
              delete options.logger;
            }
            var client = tumblr.createClient(_.defaults(
                _.clone(task.credentials), options.tumblrCredentials));

            var tumblrCallback = function(err, res) {
              var logInfo = (res && res.logInfo) || {};
              _.assign(logInfo, task.logInfo||{});
              if (err) {
                job.retry();
                logger.info('share-fail', logInfo);
              } else {
                if (options.successQueueName) {
                  mq.publish(options.successQueueName, logInfo);
                }
                logger.info('share-success', logInfo);
              }
            };


            client[task.command].apply(client, _.flatten([
              task.args, [tumblrCallback]
            ]));

          };

          q.subscribe(retry(5000, 1, qHandler));
        });

      });
      mq.on('error', function() {
        logger.error('rabbitmq-error');
      })
    }
  };
};

module.exports = self;