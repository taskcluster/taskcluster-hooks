var taskcluster = require('taskcluster-client');

options = {
  pulseUser: process.env.PULSE_USERNAME,
  pulsePass: process.env.PULSE_PASSWORD,
  newqueueName : 'pulsedMessages',
  exchange: 'exchange/taskcluster-queue/v1/task-running',
  routingKey: '#'
};

var connection = new taskcluster.PulseConnection({
  username: options.pulseUser,
  password: options.pulsePass
});

var listener = new taskcluster.PulseListener({
  connection: connection,
  queueName: options.newqueueName
});


listener.bind({
  exchange: options.exchange, 
  routingKeyPattern: options.routingKey
});

listener.on('message', (msg) => {
  queuePulses = msg;
  console.log(queuePulses);
});

 listener.resume();