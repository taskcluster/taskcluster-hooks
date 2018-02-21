var Exchanges = require('pulse-publisher');

var exchanges = new Exchanges({
  title: 'Pulse exchanges to trigger a hook',
  description: [
    'Pulse exchanges updates',
  ].join('\n'),
  schemaPrefix: 'http://schemas.taskcluster.net/hooks/v1/',
});

// Export exchanges
module.exports = exchanges;

var buildRoutingKey = (options) => {
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
var commonMessageBuilder = (message) => {
  message.version = 1;
  return message;
};

exchanges.declare({
  exchange:           'hook-created',
  name:               'hookCreated',
  title:              'Create a exchange list',
  description: [
    'New exchange was created.',
  ].join('\n'),
  routingKey:         buildRoutingKey(),
  schema:             'hook-message.json#',
  messageBuilder:     commonMessageBuilder,
  routingKeyBuilder:  () => '',
  CCBuilder:          () => [],
});

exchanges.declare({
  exchange:           'hook-updated',
  name:               'hookUpdated',
  title:              'Update a exchange list',
  description: [
    'New exchange was updated.',
  ].join('\n'),
  routingKey:         buildRoutingKey(),
  schema:             'hook-message.json#',
  messageBuilder:     commonMessageBuilder,
  routingKeyBuilder:  () => '',
  CCBuilder:          () => [],
});

exchanges.declare({
  exchange:           'hook-deleted',
  name:               'hookDeleted',
  title:              'Delete a exchange from a list',
  description: [
    'An exchange was deleted.',
  ].join('\n'),
  routingKey:         buildRoutingKey(),
  schema:             'hook-message.json#',
  messageBuilder:     commonMessageBuilder,
  routingKeyBuilder:  () => '',
  CCBuilder:          () => [],
});