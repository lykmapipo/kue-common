'use strict';


/* dependencies */
const _ = require('lodash');
const { compact } = require('@lykmapipo/common');
const { getBoolean, getNumber, getString } = require('@lykmapipo/env');
const Queue = require('kue');


/* refs */
let queue;
let client;
let pubsub;


/**
 * @function redisUrl
 * @name redisUrl
 * @description derive redis url from sources
 * @return {String|Object} redis connection string or object
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const redisUrl = () => {
  let _redisUrl = ({ port: 6379, host: '127.0.0.1' });
  _redisUrl =
    (getString('KUE_REDIS_URL') || getString('REDIS_URL') || _redisUrl);
  return _redisUrl;
};


/**
 * @function reset
 * @name reset
 * @description reset internal states and refs
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const reset = () => {
  Queue.redis.reset();
  queue = undefined;
  client = undefined;
  pubsub = undefined;
};


/**
 * @function withDefaults
 * @name withDefaults
 * @description merge provided options with defaults.
 * @param  {Object} [optns] provided options
 * @return {Object} merged options
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * const { withDefaults } = require('@lykmapipo/keu-common');
 * const redis = (process.env.REDIS_URL || { port: 6379, host: '127.0.0.1' });
 * withDefaults({ redis }) // => { redis: ...}
 */
const withDefaults = (optns) => {
  // merge defaults
  let options = _.merge({}, {
    timeout: getNumber('KUE_TIMEOUT', 5000),
    concurrency: getNumber('KUE_CONCURRENCY', 10),
    attempts: getNumber('KUE_MAX_ATTEMPTS', 3),
    priority: getString('KUE_PRIORITY', 'normal'),
    backoff: ({ type: 'exponential' }),
    removeOnComplete: getBoolean('KUE_REMOVE_ON_COMPLETE', true),
    redis: redisUrl(),
  }, optns);

  // compact and return
  options = compact(options);
  return options;
};


/**
 * @function createQueue
 * @name createQueue
 * @description create or return current queue instance.
 * @param {Object} [opts] valid queue creation options.
 * @return {Queue} valid kue.Queue instance.
 * @see {@link https://github.com/Automattic/kue#redis-connection-settings}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * const { createQueue } = require('@lykmapipo/kue-common');
 *
 * // with default options
 * const queue = createQueue();
 *
 * // with options
 * const options = { redis: 'redis://example.com:1234?redis_option=value' };
 * const queue = createQueue(options);
 */
const createQueue = (optns) => {
  // prepare options
  const options = withDefaults(optns);

  // ensure single Queue instance per process
  if (queue || Queue.singleton) {
    queue = (queue || Queue.singleton);
    return queue;
  }

  // store passed options into Queue
  Queue.prototype.options = options;

  // instatiate Queue
  queue = Queue.createQueue(options);

  // return queue
  return queue;
};


/**
 * @function createClient
 * @name createClient
 * @description create or return current redis client instance.
 * @param {Object} [opts] valid redis client options.
 * @return {Object} valid redis instance.
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * const { createClient } = require('@lykmapipo/kue-common');
 *
 * // with default options
 * const client = createClient();
 *
 * // with options
 * const options = { redis: 'redis://example.com:1234?redis_option=value' };
 * const client = createClient(options);
 */
const createClient = (optns) => {
  // ensure single redis client per Queue per process
  if (!client) {
    client = createQueue(optns).client;
    client.id = client.id || Date.now();
  }

  // return client
  return client;
};


/**
 * @function createPubSubClient
 * @name createPubSubClient
 * @description create or return current redis client instance for pubsub usage.
 * @param {Object} [opts] valid redis client options.
 * @return {Object} valid redis instance.
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * const { createPubSub } = require('@lykmapipo/kue-common');
 *
 * // with default options
 * const pubsub = createPubSub();
 *
 * // with options
 * const options = { redis: 'redis://example.com:1234?redis_option=value' };
 * const pubsub = createPubSub(options);
 */
const createPubSubClient = (optns) => {
  // ensure single redis pubsub client per Queue per process
  if (!pubsub) {
    const queue = createQueue(optns);
    pubsub = queue.pubsub = Queue.redis.pubsubClient();
    pubsub.id = pubsub.id || Date.now();
  }

  // return pubsub client
  return pubsub;
};


/**
 * @function createJob
 * @name createJob
 * @description create and return new job instance.
 * @param {Object} opts valid job creation options.
 * @param {Object} opts.type valid job type.
 * @param {Object} opts.data valid job data.
 * @param {Function} [cb] callback to invoke on success or failure.
 * @return {Job} valid kue.Job instance.
 * @see {@link https://github.com/Automattic/kue#creating-jobs}
 * @see {@link https://github.com/Automattic/kue#redis-connection-settings}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * const { createJob } = require('@lykmapipo/kue-common');
 *
 * // with default options
 * const optns = { type: 'email', data: { to:'tj@learnboost.com' } };
 * const job = createJob(optns);
 * createJob(optns, (error, job) => { ... });
 *
 * // with options
 * const optns = { type: 'email', data: { to:'tj@learnboost.com' }, attempt: 5 };
 * const job = createJob(optns);
 * createJob(optns, (error, job) => { ... });
 */
const createJob = (optns, cb) => {
  // normalize arguments
  const options = withDefaults(_.isFunction(optns) ? {} : optns);
  const done = _.isFunction(optns) ? optns : (cb || _.noop);

  // ensure queue
  const queue = createQueue(options);

  // prepare job creation options
  let { type, priority, attempts, backoff } = options;
  let { removeOnComplete, data = {} } = options;
  type = (data.type || type);
  priority = (data.priority || priority);
  attempts = (data.attempts || attempts);
  backoff = (data.backoff || backoff);
  removeOnComplete = (data.removeOnComplete || removeOnComplete);

  // create job
  const job = queue.createJob(type, data); // TODO: save optns?
  job.attempts(attempts);
  job.backoff(backoff);
  job.priority(priority);
  job.removeOnComplete(removeOnComplete);

  // save and return job
  return job.save(done);
};


/**
 * @function clear
 * @name clear
 * @description cleanup and reset current queue states.
 * @param {Function} [cb] callback to invoke on success or failure.
 * @see {@link https://github.com/Automattic/kue#redis-connection-settings}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * const { clear } = require('@lykmapipo/kue-common');
 * clear((error) => { ... });
 */
const clear = (cb) => {
  // normalize arguments
  const done = _.isFunction(cb) ? cb : _.noop;

  // ensure queue
  const queue = createQueue();

  // obtain redis client
  const client = createClient();

  // obtain cleanup key pattern
  const pattern = [queue.options.prefix, '*'].join('');

  const cleanup = (error, keys) => {
    // back-off in case of error
    if (error) {
      done(error);
    }
    // continue with cleanup
    else {
      // obtain multi to ensure atomicity on cleanup
      const multi = client.multi();

      // queue delete commands
      _.forEach(keys, function (key) {
        multi.del(key);
      });

      // execute delete command
      multi.exec(done);
    }
  };

  // obtain all queue keys and clear
  client.keys(pattern, cleanup);
};


/**
 * @function stop
 * @name stop
 * @description stop(shutdown) current running queue instance.
 * @param {Object} [opts] valid queue shutdown options.
 * @param {Object} [opts.timeout] time to wait for queue to shutdown.
 * @param {Function} [cb] callback to invoke on success or failure.
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * const { stop } = require('@lykmapipo/kue-common');
 *
 * // with default options
 * stop((error) => { ... });
 *
 * // with options
 * stop({ timeout: 5000 }, (error) => { ... });
 */
const stop = (optns, cb) => {
  // normalize arguments
  const options = withDefaults(_.isFunction(optns) ? {} : optns);
  const done = _.isFunction(optns) ? optns : (cb || _.noop);

  // obtain shutdown options
  const { timeout } = options;

  // shutdown queue instance if available
  if (queue && !queue.shuttingDown) {
    const afterShutdown = error => {
      // reset queue and client(s) when shutdown succeed
      if (!error) {
        reset();
      }
      // continue
      done(error, queue);
    };
    queue.shutdown(timeout, afterShutdown);
  }

  // no queue instance, continue
  else {
    done(null, queue);
  }
};


/* export */
module.exports = exports = {
  withDefaults,
  createQueue,
  createClient,
  createPubSubClient,
  createJob,
  clear,
  stop
};
