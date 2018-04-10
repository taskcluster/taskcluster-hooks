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

  updateListener() {

  reconcileBindings(){
    const allHookPulseExchanges = []; // from Hook table
    const allQueues = []; // from PulseQueue table
    this.allListeners = this.listeners; // from an instance variable `this.allListeners`

    //remove old listeners
    allListeners.forEach(function(queueElement) {
      if(!allHookPulseExchanges.includes(queueElement)){
        allListeners.push(queueElement);
        allListeners.pause();
      }
    });
    //remove old queues
    allQueues.forEach(function(queueElement)){
      if(!allHookPulseExchanges.includes(queueElement)){
        //then delete the queue
        allQueues.splice(allQueues.indexOf(queueElement), 1);
        if(allListeners) {
          allListeners.push(this.queueElement);
        } else {
          allListeners = this.allListeners[queueElement] = new PulseListener();
          allListeners.bind({
            this.exchange: pulses.exchange, 
            this.routingKeyPattern: pulses.routingKeyPattern,
          });
        }
      }
    }
  }
  createListener(options) {
    await setup(options);
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

      this.listeners = [];  
    }
    //listen for hooks events
    await this.listeners.bind();
  
}
  module.exports = PulseMessages;
}
