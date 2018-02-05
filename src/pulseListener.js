var taskcluster = require('taskcluster-client');
//var hookApi = require('./v1');

options = {
  pulseUser: process.env.PULSE_USERNAME,
  pulsePass: process.env.PULSE_PASSWORD,
  newqueueName : 'pulsedMessages',
  exchange: 'exchange/taskcluster-queue/v1/task-completed',
  routingKey: '#',
};

var connection = new taskcluster.PulseConnection({
  username: options.pulseUser,
  password: options.pulsePass,
});

var listener = new taskcluster.PulseListener({
  connection: connection,
  queueName: options.newqueueName,
});

listener.bind({
  exchange: 'exchange/taskcluster-queue/v1/task-completed', 
  routingKeyPattern: options.routingKey,
});

listener.on('message', (message) => {
  try {
    console.log(message);
  } catch (err) {
    reject(err);
  }
});

listener.connect().then(function(connection) {

  return connection.createChannel().then(function (channel) {
      
    var ok = channel.assertQueue(options.newqueueName, {duranle:true});
    console.log(ok);
    ok = ok.then(function(queueOk) {
      return channel.consume(options.newqueueName, function (message) {
        
      });  
    });
  })
}).catch(console.warn);

listener.resume();