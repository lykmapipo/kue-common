import { expect } from '@lykmapipo/test-helpers';
import {
  defineJob,
  dispatch,
  onJobEnqueue,
  onJobQueued,
  onJobStart,
  onJobPromotion,
  onJobComplete,
  onJobFailed,
  start,
  clear,
  stop,
} from '../src';

describe('usecases', () => {
  beforeEach((done) => clear(done));
  beforeEach((done) => stop(done));

  it('should be able to handle dispatched job', (done) => {
    const results = { success: true };
    const data = { to: 'l@j.z' };
    const jobs = defineJob({
      type: 'email',
      delay: 10,
      process: (job, next) => next(null, results),
    });
    expect(jobs.email).to.exist;

    start();

    onJobEnqueue((id, type) => {
      expect(id).to.exist;
      expect(type).to.exist;
    });

    onJobQueued((job) => {
      expect(job.id).to.exist;
      expect(job.type).to.exist;
    });

    onJobStart((id, type) => {
      expect(id).to.exist;
      expect(type).to.exist;
    });

    onJobPromotion((id) => {
      expect(id).to.exist;
    });

    onJobComplete((id, result) => {
      expect(id).to.exist;
      expect(result).to.exist;
      expect(result).to.eql(results);
      done();
    });

    onJobFailed((error) => {
      expect(error).to.not.exist;
      done(error);
    });

    dispatch({ type: 'email', data });
  });

  after((done) => clear(done));
  after((done) => stop(done));
});
