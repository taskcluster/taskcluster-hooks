const assert = require('assert');
const debug = require('debug')('listeners');

/**
 * Create pulse client and consumers to trigger hooks with pulse messages 
 *
 * options:
 * {
 *   credentials:        // Pulse  credentials
 *   Hook:               // Azure tables for hooks
*    taskcreator:        // A TaskCreator instance
 * }
 */

class PulseClient {
  constructor(options) {
    assert(options.credentials, 'Pulse credentials must be provided');

    this.credentials = options.credentials;
    this.taskcreator = options.taskcreator;
    this.Hook = options.Hook;
  }

  /**
   * Setup a new pulse client using the credentials
   * Additionally create pulse consumers for the exchanges - 
   * `hook-created, `hook-updated` and  `hook-deleted`
  */
  async setup() {
  }

  /** Create a new pulse consumer for a hook */
  createListener() {
  }
  
  /** Update the pulse consumer for a hook */
  updateListener() {
  }

  /** Delete the pulse consumer for a hook */
  deleteListener() {
  }
}

module.exports = PulseClient;