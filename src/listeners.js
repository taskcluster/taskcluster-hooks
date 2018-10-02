const assert = require('assert');
const debug = require('debug')('listeners');
const pulse = require('taskcluster-lib-pulse');
const {triggerHookCommon} = require('./v1');

/**
 * Create pulse client and consumers to trigger hooks with pulse messages 
 *
 * options:
 * {
 *   Hook:               // Azure tables for hooks
 *   taskcreator:        // A TaskCreator instance
 *   client:            // A tc-lib-pulse client instance
 * }
 */

class HookListeners {
  constructor(options) {
    assert(options.client, 'tc-lib-pulse client must be provided');

    this.taskcreator = options.taskcreator;
    this.Hook = options.Hook;
    this.client = options.client;
    this.pulseHookChangedListener = null;
    this.listeners = null;
  }

  /**
   * Setup a new pulse client using the credentials
   * Additionally create pulse consumers for the exchanges - 
   * `hook-created, `hook-updated` and  `hook-deleted`
  */
  async setup() {
    debug('Setting up the listeners');
    assert(this.listeners === null, 'Cannot setup twice');

    let handleMessage = async m =>{
      let message = m.payload;
      let exchange = m.exchange.split('/').pop();
      if (exchange == 'hook-created') { 
        await this.createListener(message); 
      } else if (exchange == 'hook-updated') {
        await this.updateListener(message); 
      } else {
        await this.deleteListener(message); 
      }
    };

    const client = this.client;
    let consumer = await pulse.consume({
      client,      
      bindings: [{
        exchange: 'exchange/taskcluster-hooks/v1/hook-created',
        routingKeyPattern: '#',
      }, {
        exchange: 'exchange/taskcluster-hooks/v1/hook-updated',
        routingKeyPattern: '#',
      }, {
        exchange: 'exchange/taskcluster-hooks/v1/hook-deleted',
        routingKeyPattern: '#',
      }],
      queueName: 'hookChanged',
      maxLength : 50,
    }, handleMessage
    );
    debug('Listening to hook exchanges');
    this.pulseHookChangedListener = consumer;
    this.listeners = [];
  }

  /** Create a new pulse consumer for a hook */
  async createListener({hookId, hookGroupId, bindings}) {
    const hook = await this.Hook.load({hookGroupId, hookId}, true);
    if (hook) {
      let listener = await pulse.consume({
        client,      
        bindings: bindings,
        queueName: `${hookGroupId}/${hookId}`, // serves as unique id for every listener
        maxLength : 50,
      }, async ({payload}) => {
        console.log(payload);
        const hook = this.hook;
        // Pass empty functions in res which are executed by `triggerHookCommon`
        // This is more of a hack so that if the payload doesnt validate against
        // `triggerSchema`,git  we can simply ignore the message.
        const res = {
          reply: function() {},
          reportError: function() {},
        };

        await triggerHookCommon.call(this, {res, hook, payload, firedBy: 'pulseHook'});
      });

      this.listeners.push(listener);
    }
  }
  
  /** Update the pulse consumer for a hook */
  async updateListener(message) {
  }

  /** Delete the pulse consumer for a hook */
  async deleteListener(mes) {
  }
}

module.exports = HookListeners;
