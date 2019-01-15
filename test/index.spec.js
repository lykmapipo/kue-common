'use strict';


process.env.NODE_ENV = 'test';


/* dependencies */
const { expect } = require('chai');
const {
  withDefaults,
  createQueue
} = require('../');


describe('kue common', () => {

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

  it.skip('should be able to create queue with custom options', () => {
    const options = { timeout: 8000, attempts: 5 };

    const queue = createQueue(options);
    expect(queue).to.exist;
    expect(queue.options.timeout).to.be.equal(8000);
    expect(queue.options.concurrency).to.be.equal(10);
    expect(queue.options.attempts).to.be.equal(5);
    expect(queue.options.backoff).to.be.eql({ type: 'exponential' });
    expect(queue.options.removeOnComplete).to.be.equal(true);
    expect(queue.options.redis).to.be.eql({ port: 6379, host: '127.0.0.1' });
  });

});
