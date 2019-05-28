'use strict';

/* dependencies */
const {
  listen,
  start,
  onError,
  onJobComplete,
  onJobFailed,
  dispatch
} = require('../');

// start queue
start();

// listen for queue error events
onError(error => {
  console.log('queue error', error);
});

// listen for job complete events
onJobComplete((id, result) => {
  console.log('job id', id);
  console.log('job results', result);
});

// listen for job failed events
onJobFailed(error => {
  console.log('job error', error);
});

// start http server
listen(error => {
  console.log('http error:', error);
});

// dispatch works
setInterval(() => {
  dispatch({ type: 'email', data: { to: 'l@j.z' } });
}, 2000)
