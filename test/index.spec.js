'use strict';


process.env.NODE_ENV = 'test';


/* dependencies */
const { expect } = require('chai');
const {
  withDefaults
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

});
