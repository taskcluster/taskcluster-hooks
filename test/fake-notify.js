let assume = require('assume');

module.exports = {
  credentials: 'test-credentials',
  authorizedScopes: ['test:scope'],
  email: (payload) => {
    assume(payload.address).exists();
    assume(payload.subject).exists();
    assume(payload.content).exists();
  },
};
