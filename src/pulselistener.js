var taskcluster = require('taskcluster-client');
var v1          = require('./v1');
var hookApi = require('./v1');

/**
 * Create a listener to trigger hooks with pulse messages 
 *
 * options:
 * {
 *   credentials:        // Pulse guardian credentials
 *   queueName:          // Queue name 
 *   exchange:           // any available exchange in pulse.mozilla.org 
 *   (reference to exchages => https://wiki.mozilla.org/Auto-tools/Projects/Pulse/Exchanges) 
 *   routingKeyPattern:         // you can filter messages arrived from a specific exchange using a 
 *   routingKeyPattern, by default: #
 * }
 */
class PulseMessages {
  constructor({credentials, queueName, exchange, routingKeyPattern, Hook, taskcreator}) {
    this.Hook = Hook;
    this.taskcreator = taskcreator;
    this.credentials = credentials;
    this.queueName = queueName;
    this.exchange = exchange;
    this.routingKeyPattern = routingKeyPattern;
  }
  /**
   * Set up the pulse message listener.
  */

  async setup(options) {
    options = options || {};
    assert(!this.connection, 'You can not setup twice!');
    this.connection = new taskcluster.PulseConnection({
      username: this.credentials.username,
      password: this.credentials.password,
    });
    this.listener = new taskcluster.PulseListener({
      connection: this.connection,
      queueName: this.queueName,
    });
    this.listener.bind({
      exchange: this.exchange, 
      routingKeyPattern: this.routingKeyPattern,
    });
    
    listener.connect().then(function(err, connection) {
      listener.on('message', (err, message) => {
        try {
          return connection.createChannel().then(function(channel) {
            var ok = channel.assertQueue(this.queueName);
            ok = ok.then(function(queueOk) {
              return channel.consume(this.queueName, function(message) {
                
              });  
            });
          });
        } catch (err) {
          reject(err);
        }
      });
    }).catch(console.warn);
    
    return listener.resume();
  }
}

module.exports = PulseMessages;