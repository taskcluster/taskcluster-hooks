var taskcluster = require('taskcluster-client');
var assert      = require('assert');

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
  
  updateListener() {

  }
  deleteListesner() {

  }
  createListener(options) {
    await this.setup(options);
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

  this.listeners = [];

  const handleMessage = async (message, hookGroupId, hookId) => {
    // get hook (in case it has changed)
    let hook = await this.Hook.load({
      hookGroupId: hookGroupId,
      hookId: hookId,
    }, true);
    
    //fire 
    this.taskcreator.fire(hook, message.payload);
  };

  await this.Hook.scan({}, {
    handler: hook => {
      if (hook.pulseExchanges.length > 0) {        
        var listener = new taskcluster.PulseListener({
          connection: this.connection,
          queueName: [hook.hookGroupId, '/', hook.hookId].join(''),
        });
        
        hook.pulseExchanges.forEach(pulses => {
          console.log(`Binding to ${pulses.exchange} (${pulses.routingKeyPattern}) \
                       for ${hook.hookGroupId}/${hook.hookId}`);
          listener.bind({
            exchange: pulses.exchange, 
            routingKeyPattern: pulses.routingKeyPattern,
          });
        });

        listener.on('message',
          (message) => handleMessage(message, hook.hookGroupId, hook.hookId));

        listener.resume();
        this.listeners.push(listener);
      }
    },
  });
}
}

module.exports = PulseMessages;
