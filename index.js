'use strict';


/* dependencies */
const _ = require('lodash');
const { compact } = require('@lykmapipo/common');
const { getBoolean, getNumber, getString } = require('@lykmapipo/env');
const Queue = require('kue');
// const { Job } = Queue;


/* refs */
let queue;


/**
 * @function redisUrl
 * @name redisUrl
 * @description derive redis url
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

  // ensure only one instance of Queue exists per process
  if (Queue.singleton) {
    queue = Queue.singleton;
    return queue;
  }

  // store passed options into Queue
  Queue.prototype.options = options;

  // instatiate kue
  queue = Queue.createQueue(options);

  // return queue
  return queue;
};


/**
 * @function createJob
 * @name createJob
 * @description create and return new job instance.
 * @param {Object} opts valid job creation options.
 * @param {Object} opts.type valid job type.
 * @param {Object} opts.data valid job data.
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

  // return job
  return job.save(done);
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
 */
const stop = (optns, cb) => {
  // normalize arguments
  const options = withDefaults(_.isFunction(optns) ? {} : optns);
  const done = _.isFunction(optns) ? optns : (cb || _.noop);

  // obtain shutdown options
  const { timeout } = options;

  // TODO clear any other clients
  // TODO remove all queue listeners?

  // shutdown queue instance if available
  if (queue && !queue.shuttingDown) {
    const afterShutdown = error => {
      // reset queue when shutdown succeed
      if (!error) {
        queue = undefined;
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
  createJob,
  stop
};
