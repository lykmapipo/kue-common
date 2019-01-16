'use strict';


process.env.NODE_ENV = 'test';


/* dependencies */
const { expect } = require('chai');
const {
  withDefaults,
  createQueue,
  createJob,
  stop
} = require('../');


describe('kue common', () => {

  beforeEach(done => stop(done));

  it('should merge options with defaults', () => {
    expect(withDefaults).to.exist;
    expect(withDefaults).to.be.a('function');
    expect(withDefaults.name).to.be.equal('withDefaults');
    expect(withDefaults.length).to.be.equal(1);

    const options = withDefaults();
    expect(options.timeout).to.be.equal(5000);
    expect(options.concurrency).to.be.equal(10);
    expect(options.attempts).to.be.equal(3);
    expect(options.backoff).to.be.eql({ type: 'exponential' });
    expect(options.removeOnComplete).to.be.equal(true);
    expect(options.redis).to.be.eql({ port: 6379, host: '127.0.0.1' });
  });

  it('should be able to create queue with default options', () => {
    expect(createQueue).to.exist;
    expect(createQueue).to.be.a('function');
    expect(createQueue.name).to.be.equal('createQueue');
    expect(createQueue.length).to.be.equal(1);

    const queue = createQueue();
    expect(queue).to.exist;
    expect(queue.options.timeout).to.be.equal(5000);
    expect(queue.options.concurrency).to.be.equal(10);
    expect(queue.options.attempts).to.be.equal(3);
    expect(queue.options.backoff).to.be.eql({ type: 'exponential' });
    expect(queue.options.removeOnComplete).to.be.equal(true);
    expect(queue.options.redis).to.be.eql({ port: 6379, host: '127.0.0.1' });
  });

  it('should ensure single queue per process', () => {
    const first = createQueue();
    expect(first).to.exist;

    const second = createQueue();
    expect(second).to.exist;

    expect(first.id).to.be.equal(second.id);
  });

  it('should be able to create queue with custom options', () => {
    const options = {
      timeout: 8000,
      concurrency: 5,
      attempts: 5,
      redis: 'redis://localhost:6379'
    };

    const queue = createQueue(options);
    expect(queue).to.exist;
    expect(queue.options.timeout).to.be.equal(options.timeout);
    expect(queue.options.concurrency).to.be.equal(options.concurrency);
    expect(queue.options.attempts).to.be.equal(options.attempts);
    expect(queue.options.backoff).to.be.eql({ type: 'exponential' });
    expect(queue.options.removeOnComplete).to.be.equal(true);
    expect(queue.options.redis)
      .to.be.eql({ port: '6379', db: 0, host: 'localhost', options: {} });
  });

  it('should be able to create job with default options', () => {
    expect(createJob).to.exist;
    expect(createJob).to.be.a('function');
    expect(createJob.name).to.be.equal('createJob');
    expect(createJob.length).to.be.equal(2);

    const options = {
      type: 'email',
      data: { to: 'tj@learnboost.com' }
    };
    const job = createJob(options);
    expect(job).to.exist;
    expect(job.type).to.be.equal(options.type);
    /*jshint camelcase:false */
    expect(job._max_attempts).to.be.equal(3);
    expect(job._priority).to.be.equal(0);
    expect(job._backoff).to.be.eql({ type: 'exponential' });
    expect(job._removeOnComplete).to.be.true;
    /*jshint camelcase:true */
    expect(job.data).to.be.eql(options.data);
  });

  it('should be able to create job with custom options', () => {
    expect(createJob).to.exist;
    expect(createJob).to.be.a('function');
    expect(createJob.name).to.be.equal('createJob');
    expect(createJob.length).to.be.equal(2);

    const options = {
      type: 'email',
      data: { to: 'tj@learnboost.com' },
      attempts: 4,
      priority: 'high'
    };
    const job = createJob(options);
    expect(job).to.exist;
    expect(job.type).to.be.equal(options.type);
    /*jshint camelcase:false */
    expect(job._max_attempts).to.be.equal(4);
    expect(job._priority).to.be.equal(-10);
    expect(job._backoff).to.be.eql({ type: 'exponential' });
    expect(job._removeOnComplete).to.be.true;
    /*jshint camelcase:true */
    expect(job.data).to.be.eql(options.data);
  });

});
