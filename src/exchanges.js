let Exchanges = require('pulse-publisher');

/** Declaration of exchanges used by hooks  */
let exchanges = new Exchanges({
  title:       'Exchnages to manage hooks',
  projectName: 'taskcluster-hooks',
  serviceName: 'hooks',
  version: 'v1',
  description: [
    'Hooks are responsible for creating tasks',
    'at specific times or in response to webhooks and API calls.',
    'Using this exchange allows us to make hooks which',
    'repsond to particular pulse messages.',
    '',
    'For each of the exchanges defined below,',
    'there is a listener which creates ,updates or deletes',
    'a hook. Basically it creates another listener,',
    'with the neccessary bindings, which creates the task',
    'for every message it receives.',
  ].join(''),
});

// Export exchanges
module.exports = exchanges;

/** Build common routing key construct for `exchanges.declare` */
var buildCommonRoutingKey = (options) => {
  return [
    {
      name:             'reserved',
      summary:          'Space reserved for future routing-key entries, you ' +
                        'should always match this entry with `#`. As ' +
                        'automatically done by our tooling, if not specified.',
      multipleWords:    true,
      maxSize:          10,
    },
  ];
};

/** Build an AMQP compatible message from a message */
var commonMessageBuilder = function(message) {
  message.version = 1;
  return message;
};

/** Build a routingKey from message */
/** Empty now, might be useful in the future */
/** when this comment should be removed */
var commonRoutingKeyBuilder = function(message, routing) {
  return '';
};

/** Build list of routing keys to CC */
/** Empty now, might be useful in the future */
/** when this comment should be removed */
var commonCCBuilder = function(message, routes) {
  return [];
};

// Hook created exchange
exchanges.declare({
  exchange: 'hook-created',
  name:     'hookCreated',
  title:    'Hook Created Messages',
  description: [
    'Whenever the api receives a request to create a',
    'pulse based hook, a message is posted to this exchange and',
    'the receiver creates a listener with the bindings, to create a task',
  ].join(''),
  schema:   'pulse-hook-message.json#',
  messageBuilder: commonMessageBuilder,
  routingKey: buildCommonRoutingKey(),
  routingKeyBuilder: commonRoutingKeyBuilder,
  CCBuilder: commonCCBuilder,
});

// Hook updated exchange
exchanges.declare({
  exchange: 'hook-updated',
  name:     'hookUpdated',
  title:    'Hook Updated Messages',
  description: [
    'Whenever the api receives a request to update a',
    'pulse based hook, a message is posted to this exchange and',
    'the receiver updates the listener associated with that hook.',
  ].join(''),
  schema:   'pulse-hook-message.json#',
  messageBuilder: commonMessageBuilder,
  routingKey: buildCommonRoutingKey(),
  routingKeyBuilder: commonRoutingKeyBuilder,
  CCBuilder: commonCCBuilder,
});

// Hook deleted exchange
exchanges.declare({
  exchange: 'hook-deleted',
  name:     'hookDeleted',
  title:    'Hook Deleted Messages',
  description: [
    'Whenever the api receives a request to delete a',
    'pulse based hook, a message is posted to this exchange and',
    'the receiver deletes the listener associated with that hook.',
  ].join(''),
  schema:   'pulse-hook-message.json#',
  messageBuilder: commonMessageBuilder,
  routingKey: buildCommonRoutingKey(),
  routingKeyBuilder: commonRoutingKeyBuilder,
  CCBuilder: commonCCBuilder,
});
