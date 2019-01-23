'use strict';


process.env.NODE_ENV = 'test';


/* dependencies */
const { expect } = require('chai');
const {
  defineJob,
  loadJobs,
  clear,
  stop
} = require('../');


describe('usecases', () => {

  before(done => clear(done));

  it('should be able to register a job definition', () => {
    expect(defineJob).to.exist;
    expect(defineJob).to.be.a('function');
    expect(defineJob.name).to.be.equal('defineJob');
    expect(defineJob.length).to.be.equal(1);
  });

  it('should register a job definition with defaults', () => {
    const def = { type: 'email', process: (job, done) => done() };
    const jobs = defineJob(def);
    expect(jobs.email).to.exist;
    expect(jobs.email.timeout).to.be.equal(5000);
    expect(jobs.email.concurrency).to.be.equal(10);
    expect(jobs.email.attempts).to.be.equal(3);
    expect(jobs.email.backoff).to.be.eql({ type: 'exponential' });
    expect(jobs.email.removeOnComplete).to.be.equal(true);
  });

  it('should not register a job definition with no handler', () => {
    const def = { type: 'resize' };
    const jobs = defineJob(def);
    expect(jobs.resize).not.to.exist;
  });

  it('should be able to load job definition', () => {
    expect(loadJobs).to.exist;
    expect(loadJobs).to.be.a('function');
    expect(loadJobs.name).to.be.equal('loadJobs');
    expect(loadJobs.length).to.be.equal(1);
  });

  it('should load job definitions with defaults', () => {
    const jobs = loadJobs({ jobsPath: `${__dirname}/jobs` });
    expect(jobs.compress).to.exist;
    expect(jobs.compress.timeout).to.be.equal(5000);
    expect(jobs.compress.concurrency).to.be.equal(10);
    expect(jobs.compress.attempts).to.be.equal(3);
    expect(jobs.compress.backoff).to.be.eql({ type: 'exponential' });
    expect(jobs.compress.removeOnComplete).to.be.equal(true);
  });

  after(done => clear(done));
  after(done => stop(done));

});
