const assert = require('assert');
const debug = require('debug')('listeners');
const pulse = require('taskcluster-lib-pulse');

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
    assert(options.client, 'tc-lib-pulse clietn must be provided');

    this.taskcreator = options.taskcreator;
    this.Hook = options.Hook;
    this.client = options.client;
  }

  /**
   * Setup a new pulse client using the credentials
   * Additionally create pulse consumers for the exchanges - 
   * `hook-created, `hook-updated` and  `hook-deleted`
  */
  async setup() {
    
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
    console.log('consuming');
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
    console.log('consumed');
  }

  /** Create a new pulse consumer for a hook */
  async createListener(message) {

  }
  
  /** Update the pulse consumer for a hook */
  async updateListener(message) {
  }

  /** Delete the pulse consumer for a hook */
  async deleteListener(mes) {
  }
}

module.exports = HookListeners;