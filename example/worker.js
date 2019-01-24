'use strict';

/* dependencies */
const { start, onError, onJobComplete, onJobFailed, dispatch } = require('../');

start();

onError((error) => {
  console.log('queue error', error);
});

onJobComplete((id, result) => {
  console.log('job id', id);
  console.log('job results', result);
});

onJobFailed((error) => {
  console.log('job error', error);
});

setInterval(() => {
  dispatch({ type: 'email', data: { to: 'l@j.z' } });
}, 2000)
