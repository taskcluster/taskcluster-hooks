const Entity = require('azure-entities');
const Promise = require('promise');

const LastFire = Entity.configure({
  version:              1,
  partitionKey:         Entity.keys.StringKey('hookGroupId'),
  rowKey:               Entity.keys.ConstantKey('task-record'),
  signEntities:         true,
  properties:           {
    hookGroupId:        Entity.types.String,
    hookId:             Entity.types.String,
    taskId:             Entity.types.EncryptedText,
    taskCreateTime:     Entity.types.Date,
  },
});

LastFire.prototype.definition = function() {
  return Promise.resolve({
    hookGroupId:  this.hookGroupId,
    hookId: this.hook,
  });
};

exports.LastFire = LastFire;