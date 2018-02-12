/* This tests were builded to test fuctionaties of pulselistener packages*/
/* Note: Using fake messages in test because this avoid any king of 
inconvenient and error-prone to use a real Pulse credentials here.*/

suite('PulseListener', function() {
  var Promise         = require('promise');
  var assert          = require('assert');
  var helper            = require('./helper');
  var taskcreator       = require('../src/taskcreator');
  var taskcluster       = require('taskcluster-client');
  var PulseListener   = require('../src/pulselistener');

  var hookDef = require('./test_definition');
  let hookWithPulseExc = _.defaults(
    { 
      triggerSchema: {type: 'object', 
        properties:{
          location:
          {
            type: 'string',
            default: 'Niskayuna, NY',
          }, 
          otherVariable: {
            type: 'number',
            default: '12',
          },
        }, 
        additionalProperties: false,
      },
    }, hookDef);


  this.slow(500);
  helper.setup();

  var creator = null;
  var consumer  = null;
  
  let setHookLastFire = async (hookGroupId, hookId, lastFire) => {
    let hook = await helper.Hook.load({hookGroupId, hookId}, true);
    await hook.modify((hook) => { hook.lastFire = lastFire; });
  };

  suite('with fake PulseListener', function() {
    test('bind and listen', function() {
      // Create listener
      var listener = new taskcluster.PulseListener({
        credentials: {fake: true},
        Hook: helper.Hook,
        taskcreator: creator,
        queueName: 'foo',
      });
      listener.bind({
        exchange: 'exchange/testy/test-exchange',
        routingKeyPattern: '#',
      });

      var result = new Promise(function(accept, reject) {
        listener.on('message', function(message) {
          try {
            assert.equal(message.payload.text, 'my message');
            assert.equal(message.exchange, 'exchange/testy/test-exchange');
          } catch (err) {
            reject(err);
          }
          accept();
        });
        listener.on('error', function(err) {
          reject(err);
        });
      });

      var published = listener.resume().then(function() {
        return listener.fakeMessage({
          payload: {text: 'my message'},
          exchange: 'exchange/testy/test-exchange',
          routes: ['another.route'],
        });
      });

      return Promise.all([published, result]);
    });
    
    test('load a hook', function(){
      await setHookLastFire('garbage', 'on-pulse-message', {result: 'success', taskId: 'E5SBRfo-RfOIxh0V4187Qg', time: now});
    });

    test('bind and listen', function() {
      // Create listener
      var listener = new taskcluster.PulseListener({
        credentials: {fake: true},
        Hook: helper.Hook,
        taskcreator: creator,
        queueName: 'foo',
      });
      listener.bind({
        exchange: 'exchange/testy/test-exchange',
        routingKeyPattern: '#',
      });

      var result = new Promise(function(accept, reject) {
        listener.on('message', function(message) {
          try {
            assert.equal(message.payload.text, 'my message');
            assert.equal(message.exchange, 'exchange/testy/test-exchange');
          } catch (err) {
            reject(err);
          }
          accept();
        });
        listener.on('error', function(err) {
          reject(err);
        });
      });

      var published = listener.resume().then(function() {
        return listener.fakeMessage({
          payload: {text: 'my message'},
          exchange: 'exchange/testy/test-exchange',
          routes: ['another.route'],
        });
      });

      return Promise.all([published, result]);
    });
  });
});