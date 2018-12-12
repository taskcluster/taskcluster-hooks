const assert = require('assert');
const debug = require('debug')('listeners');
const pulse = require('taskcluster-lib-pulse');
const _ = require('lodash');
const {serialize} = require('async-decorators');

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
    this.Queues = options.Queues;
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
    }, (msg) => this.reconcileConsumers()
    );
    debug('Listening to hook exchanges');
    this.pulseHookChangedListener = consumer;
    this.listeners = [];
    // Reconcile on start up
    await this.reconcileConsumers();
  }

  /** Create a new pulse consumer for a hook */
  async createListener({hook, oldBindings}) {
    this.hook = hook;
    const client =  this.client;
    const queueName = `${hook.hookGroupId}/${hook.hookId}`; // serves as unique id for every listener
    const listener = await pulse.consume({
      client,      
      queueName, 
      maxLength : 50,
    }, async ({payload}) => {
      const hook = this.hook;
      // Fire the hook
      await this.taskcreator.fire(hook, {firedBy:'pulseMessage', payload});
    });
    if (!this.client.isFakeClient) {
      for (let {exchange, routingKeyPattern} of oldBindings) {
        await this.client.withChannel(async channel => channel.unbindQueue(queueName, exchange, routingKeyPattern));
      }
      for (let {exchange, routingKeyPattern} of hook.bindings) {
        await this.client.withChannel(async channel => {channel.bindQueue(queueName, exchange, routingKeyPattern);});
      }
    }
    this.listeners.push(listener);
  }

  /** Deletes the amqp queue if it exists for a real pulse client */
  async deleteQueue(queueName) {
    if (!this.client.isFakeClient) {
      if (await this.client.withChannel(async channel => channel.checkQueue(queueName))) {
        await this.client.withChannel(async channel => channel.deleteQueue(queueName));
      }
    }
  };
  
  async reconcileConsumers() {
    let Queues = [];
    let allHooksData = [];
    await this.Queues.scan(
      {},
      {
        limit: 1000,
        handler:(queue) => Queues.push(queue),
      }
    );
    let continuationToken = undefined;
    
    do {
      allHooksData  = await this.Hook.scan({}, {
        limit: 1000,
        continuation: continuationToken,
      });
      continuationToken = allHooksData.continuation;
      allHooksData.entries.forEach(async (hook) => {
        if (hook.bindings.length != 0) {
          const {hookGroupId, hookId} = hook;
          const queue = _.find(Queues, {hookGroupId, hookId});
          if (queue) {
            const index = this.listeners.findIndex(({_queueName}) => listener._queueName === queue.queueName);
            if (index == -1) {
              debug('Existing queue..creating listener');
              await this.createListener({hook, oldBindings: queue.bindings});
            }
            _.pull(Queues, queue);
          } else {
            debug('New queue..creating listener');
            await this.createListener({hook, oldBindings: []});
            // Add to Queues table
            debug('adding to Queues table');
            await this.Queues.create({
              hookGroupId,
              hookId,
              queueName: `${hookGroupId}/${hookId}`,
              bindings: hook.bindings,
            });
          }
        }
      });
    } while (continuationToken);
    
    // Delete the queues now left in the Queues list.
    Queues.forEach(async (queue) => {     
      // Delete the amqp queue
      await this.deleteQueue(queue.queueName);
      // Delete from this.listeners
      let removeIndex = this.listeners.findIndex(({_queueName}) => queue.queueName === _queueName);
      if (removeIndex > -1) {
        const listener = this.listeners[removeIndex];
        listener.stop();
        this.listeners.splice(removeIndex, 1);
      }
      await queue.remove();
    });
  }

  async terminate() {
    debug('Deleting all queues..');
    await this.Queues.scan(
      {},
      {
        limit: 1000,
        handler: async (queue) => {
          // Delete the amqp queue
          await this.deleteQueue(queue.queueName);
          await queue.remove();
        },
      }
    );

    // stop all consumers instead
    if (!this.client.isFakeClient) {
      this.listeners.forEach((consumer) => {
        consumer.stop();
      });
    }
    this.listeners = null;
  }
}

module.exports = HookListeners;
