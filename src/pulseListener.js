var taskcluster = require('taskcluster-client');
var queuePulses = new taskcluster.QueueEvents();

options = {
  pulseUser: process.env.PULSE_USERNAME,
  pulsePass: process.env.PULSE_PASSWORD,
  exchange: 'exchange/taskcluster-queue/v1/task-running',
  routingKey: '#',
  durableQueue: queuePulses
}

var connection = new taskcluster.PulseConnection({
  username: options.pulseUser,
  password: options.pulsePass
});

var listener = new taskcluster.PulseListener({
  connection: connection,
  credentials: {
    username: options.pulseUser,
    password: options.password
  },
  queueName: options.durableQueue,
});


listener.bind({
  exchange: options.exchange, 
  routingKeyPattern: options.routingKey
});

console.log('Queue', queuePulses);

listener.on('message', (msg) => {
  queuePulses = msg;
  //console.log(queuePulses);
});

 listener.resume();