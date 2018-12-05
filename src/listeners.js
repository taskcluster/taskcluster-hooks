const assert = require('assert');
const debug = require('debug')('listeners');
const pulse = require('taskcluster-lib-pulse');
const {triggerHookCommon} = require('./v1');
const Entity = require('azure-entities');
const _ = require('lodash');

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

    const reconcileConsumers = this.reconcileConsumers;

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
      //expires : 1800000,

    }, (msg) => this.reconcileConsumers()
    );
    debug('Listening to hook exchanges');
    this.pulseHookChangedListener = consumer;
    this.listeners = [];
  }

  /** Create a new pulse consumer for a hook */
  async createListener({hookId, hookGroupId, bindings}, oldBindings) {
    const hook = await this.Hook.load({hookGroupId, hookId}, true);
    if (hook) {
      let listener = await pulse.consume({
        client,      
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
      for (let {exchange, routingKeyPattern} of oldBindings) {
        await this.client.withChannel.unbindQueue(queueName, exchange, routingKeyPattern);
      }
      for (let {exchange, routingKeyPattern} of bindings) {
        await this.client.withChannel.bindQueue(queueName, exchange, routingKeyPattern);
      }

      this.listeners.push(listener);
    }
  }
  
  async reconcileConsumers() {
    let Queues = [];
    let allHooksData = [];
    console.log('helelo');
    await this.Queues.scan(
      {},
      {
        limit: 1000,
        handler:(queue) => Queues.push(queue),
      }
    );

    let continuationToken = undefined;
    
    do {
      allHooksData  = await this.Hooks.scan({
        bindings:   Entity.op.notEqual([]),
      }, {
        limit: 1000,
        continuation: continuationToken,
      });
      continuationToken = allHooksData.continuation;
      allHooksData.entries.forEach(hook => {
        const {hookGroupId, hookId} = hook;
        const queue = _.find(Queues, {hookGroupId, hookId});
        if (queue) {
          const index = this.listeners.findIndex(({_queueName}) => listener._queueName === queue.queueName);
          if (index == -1) {
            this.createListener(hook, queue.bindings);
          }
          _.pull(Queues, queue);
        } else {
          this.createListener(hook, {});
        }
      });
    } while (continuationToken);
    
    // Delete the queues now left in the Queues list.
    Queues.forEach(async (queue) => {     
      if (this.client.withChannel.checkQueue(queue.queueName)) {
        this.client.withChannel.deleteQueue(queue.queueName);
      }
    });
  }

}

module.exports = HookListeners;
