'use strict';


/* dependencies */
const _ = require('lodash');
const requireAll = require('require-all');
const { compact } = require('@lykmapipo/common');
const { getBoolean, getNumber, getString } = require('@lykmapipo/env');
const Queue = require('kue');


/* refs */
let queue;
let client;
let pubsub;
let jobs = {};


/**
 * @description job specific priorities.
 * @see {@link https://github.com/Automattic/kue#job-priority}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 * @example
 * const { PRIORITY_HIGH, createJob } = require('@lykmapipo/kue-common');
 * const job = createJob({ priority: PRIORITY_HIGH });
 */
const PRIORITY_LOW = 'low';
const PRIORITY_NORMAL = 'normal';
const PRIORITY_MEDIUM = 'medium';
const PRIORITY_HIGH = 'high';
const PRIORITY_CRITICAL = 'critical';


/**
 * @description job specific events fired via pubsub.
 * @see {@link https://github.com/Automattic/kue#job-events}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 * @example
 * const { COMPLETE, createJob } = require('@lykmapipo/kue-common');
 * const job = createJob({ ... });
 * job.on(COMPLETE, result => { ... });
 */
const ENQUEUE = 'enqueue';
const START = 'start';
const PROMOTION = 'promotion';
const PROGRESS = 'progress';
const FAILED_ATTEMPT = 'failed attempt';
const FAILED = 'failed';
const COMPLETE = 'complete';
const REMOVE = 'remove';


/**
 * @description queue specific events fired via pubsub.
 * @see {@link https://github.com/Automattic/kue#queue-events}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 * @example
 * const { COMPLETE, createQueue } = require('@lykmapipo/kue-common');
 * const queue = createQueue({ ... });
 * queue.on(JOB_COMPLETE, result => { ... });
 */
const JOB_ENQUEUE = 'job enqueue';
const JOB_START = 'job start';
const JOB_PROMOTION = 'job promotion';
const JOB_PROGRESS = 'job progress';
const JOB_FAILED_ATTEMPT = 'job failed attempt';
const JOB_FAILED = 'job failed';
const JOB_COMPLETE = 'job complete';
const JOB_REMOVE = 'job remove';


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
  jobs = {};
};


/**
 * @function withDefaults
 * @name withDefaults
 * @description merge provided options with defaults.
 * @param {Object} [optns] provided options
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
    jobEvents: getBoolean('KUE_JOB_EVENTS', false),
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
 * @function isJobDefinition
 * @name isJobDefinition
 * @description check if provided object is valid job definition.
 * @param {Object} job job definition.
 * @return {Boolean} if object is job definition otherwise false
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const isJobDefinition = (job) => {
  const hasType = (job && !_.isEmpty(job.type));
  const hasHandler = (job && _.isFunction(job.process));
  const isValid = (hasType && hasHandler);
  return isValid;
};


/**
 * @function defineJob
 * @name defineJob
 * @description prepare job definition for later job creation, dispatching and
 * processing.
 * @param {Object} def job definition.
 * @param {Object} def.type unique valid job type.
 * @param {Object} def.process unique valid job type.
 * @return {Object[]} current job definitions.
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * const { defineJob } = require('@lykmapipo/kue-common');
 * defineJob({type: 'email', process: (job, done) => { ... }}); // => jobs
 */
const defineJob = (def) => {
  // merge with defaults
  const job = withDefaults(def);

  // collect valid job definition
  const isValidJob = isJobDefinition(job);
  if (isValidJob) {
    jobs[job.type] = job;
  }

  // return job definitions
  return jobs;
};


/**
 * @function loadJobs
 * @name loadJobs
 * @description load jobs definition and prepare for later job creation,
 * dispatching and processing.
 * @param {Object} def loading options.
 * @param {Object} [def.jobsPath=processs.KUE_JOBS_PATH] jobs definitio path
 * @return {Object[]} current job definitions.
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * const { loadJobs } = require('@lykmapipo/kue-common');
 *
 * // with default job path
 * loadJobs(); // => { email: {...}, sms: {...} };
 *
 * // with custom jobs path
 * loadJobs({ jobsPath: __dirname }); // => { email: {...}, sms: {...} };
 */
const loadJobs = (optns) => {
  // merge with defaults
  const options = withDefaults(optns);

  try {
    // load jobs definitions
    const { jobsPath = `${process.cwd()}/jobs` } = options;
    const defs = requireAll(jobsPath);

    // collect valid job definitions
    const loadJob = def => defineJob(def);
    _.forEach(defs, loadJob);
  } catch (error) {
    /* ignore*/
  }

  // return job definitions
  return jobs;
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
 * const job = createJob(optns); // no callback
 * createJob(optns, (error, job) => { ... });
 *
 * // with options
 * const optns = { type: 'email', data: { to:'tj@learnboost.com' }, attempt: 5 };
 * const job = createJob(optns); // no callback
 * createJob(optns, (error, job) => { ... });
 */
const createJob = (optns, cb) => {
  // normalize arguments
  const options = withDefaults(_.isFunction(optns) ? {} : optns);
  const done = _.isFunction(optns) ? optns : cb;

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
  if (_.isFunction(done)) {
    return job.save(done);
  }
  // return job
  else {
    return job;
  }
};


/**
 * @function dispatch
 * @name dispatch
 * @description create new job instance from previously job definition.
 * @param {Object} opts valid job creation options.
 * @param {Object} opts.type valid job type.
 * @param {Object} opts.data valid job data.
 * @param {Function} [cb] callback to invoke on success or failure.
 * @return {Job} valid kue.Job instance.
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * const { dispatch } = require('@lykmapipo/kue-common');
 *
 * // with default options
 * const optns = { type: 'email', data: { to:'tj@learnboost.com' } };
 * const job = dispatch(optns); // no callback
 * dispatch(optns, (error, job) => { ... });
 *
 * // with options
 * const optns = { type: 'email', data: { to:'tj@learnboost.com' }, attempt: 5 };
 * const job = dispatch(optns); // no callback
 * dispatch(optns, (error, job) => { ... });
 */
const dispatch = (optns, cb) => {
  // normalize arguments
  const options = withDefaults(_.isFunction(optns) ? {} : optns);
  const done = _.isFunction(optns) ? optns : (cb || _.noop);

  // ensure job type provided
  const { type } = options;

  // ensure queue can process give job type
  const definition = _.merge({}, jobs[type], options); // TODO no job def?

  // create job
  const job = createJob(definition);

  // save and return job
  return job.save(done);
};


/**
 * @function clear
 * @name clear
 * @description cleanup and reset current queue states.
 * @param {Object} [optns] valid queue options
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
const clear = (optns, cb) => {
  // normalize arguments
  const options = withDefaults(_.isFunction(optns) ? {} : optns);
  const done = _.isFunction(optns) ? optns : (cb || _.noop);

  // ensure queue
  const queue = createQueue(options);

  // obtain redis client
  const client = createClient(options);

  // obtain cleanup key pattern
  const { prefix = queue.options.prefix } = options;
  const pattern = `${prefix}*`;

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
 * @function start
 * @name start
 * @description load jobs definition and start to process
 * @param {Object} [optns] valid start options
 * @return {Queue} valid kue.Queue instance.
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * const { start } = require('@lykmapipo/kue-common');
 * start();
 */
const start = (optns) => {
  // load jobs definition
  const jobs = loadJobs(optns);

  // ensure worker queue is initialized
  const queue = createQueue(optns);

  // start worker for processing jobs
  if (queue && !_.isEmpty(jobs)) {
    // register job worker fn
    const perform = (job, type) => {
      // fix job ttl exceeded listeners added
      // see https://github.com/Automattic/kue/issues/1189
      const currentMaxListener = (queue.getMaxListeners() + job.concurrency);
      queue.setMaxListeners(currentMaxListener);
      queue.process(type, job.concurrency, job.process);
    };
    // do registration
    _.forEach(jobs, perform);
  }

  // return queue
  return queue;
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
    // do shutdown
    queue.shutdown(timeout, afterShutdown);
  }

  // no queue instance, continue
  else {
    done(null, queue);
  }
};


/**
 * @function onJobEnqueue
 * @name onJobEnqueue
 * @description register queue `job enqueue` events listener.
 * @param {Function} cb a valid event listener
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 */
const onJobEnqueue = cb => queue && queue.on(JOB_ENQUEUE, cb);


/**
 * @function onJobStart
 * @name onJobStart
 * @description register queue `job start` events listener.
 * @param {Function} cb a valid event listener
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 */
const onJobStart = cb => queue && queue.on(JOB_START, cb);


/**
 * @function onJobPromotion
 * @name onJobPromotion
 * @description register queue `job promotion` events listener.
 * @param {Function} cb a valid event listener
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 */
const onJobPromotion = cb => queue && queue.on(JOB_PROMOTION, cb);


/**
 * @function onJobProgress
 * @name onJobProgress
 * @description register queue `job progress` events listener.
 * @param {Function} cb a valid event listener
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 */
const onJobProgress = cb => queue && queue.on(JOB_PROGRESS, cb);


/**
 * @function onFailedAttempt
 * @name onFailedAttempt
 * @description register queue `job failed attempt` events listener.
 * @param {Function} cb a valid event listener
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 */
const onJobFailedAttempt = cb => queue && queue.on(JOB_FAILED_ATTEMPT, cb);


/**
 * @function onJobFailed
 * @name onJobFailed
 * @description register queue `job failed` events listener.
 * @param {Function} cb a valid event listener
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 */
const onJobFailed = cb => queue && queue.on(JOB_FAILED, cb);


/**
 * @function onJobComplete
 * @name onJobComplete
 * @description register queue `job complete` events listener.
 * @param {Function} cb a valid event listener
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 */
const onJobComplete = cb => queue && queue.on(JOB_COMPLETE, cb);


/**
 * @function onJobRemove
 * @name onJobRemove
 * @description register queue `job remove` events listener.
 * @param {Function} cb a valid event listener
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 */
const onJobRemove = cb => queue && queue.on(JOB_REMOVE, cb);


/**
 * @function onError
 * @name onError
 * @description register queue `error` events listener.
 * @param {Function} cb a valid event listener
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 */
const onError = cb => queue && queue.on('error', cb);


/* export */
module.exports = exports = {
  PRIORITY_LOW,
  PRIORITY_NORMAL,
  PRIORITY_MEDIUM,
  PRIORITY_HIGH,
  PRIORITY_CRITICAL,
  ENQUEUE,
  START,
  PROMOTION,
  PROGRESS,
  FAILED_ATTEMPT,
  FAILED,
  COMPLETE,
  REMOVE,
  JOB_ENQUEUE,
  JOB_START,
  JOB_PROMOTION,
  JOB_PROGRESS,
  JOB_FAILED_ATTEMPT,
  JOB_FAILED,
  JOB_COMPLETE,
  JOB_REMOVE,
  withDefaults,
  createQueue,
  createClient,
  createPubSubClient,
  defineJob,
  loadJobs,
  createJob,
  dispatch,
  clear,
  start,
  stop,
  onJobEnqueue,
  onJobStart,
  onJobPromotion,
  onJobProgress,
  onJobFailedAttempt,
  onJobFailed,
  onJobComplete,
  onJobRemove,
  onError
};
