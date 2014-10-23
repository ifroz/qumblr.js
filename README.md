qumblr.js
=========

## Usage

```javascript
qumblr({ logger: logger }).listen({
  amqpCredentials: {
    host: 'localhost',
    // ... params for node-amqp
  },
  queueName: 'tumblr-queue',
  successQueueName: 'tumblr-queue-success',
  tumblrCredentials: {
    // ... params for tumblr-pool.js createClient
  }
});
```
