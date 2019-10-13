'use strict';

/* dependencies */
const {
  listen,
  start,
  onError,
  onJobComplete,
  onJobFailed,
  onJobRemove,
  dispatch
} = require('../lib');

// start queue
start();

// listen for queue error events
onError(error => {
  console.log('queue error: ', error);
});

// listen for job complete events
onJobComplete((id, result) => {
  console.log('job id: ', id);
  console.log('job results: ', result);
});

// listen for job remove events
onJobRemove((id, type) => {
  console.log('job id: ', id);
  console.log('job removed: ', type);
});

// listen for job failed events
onJobFailed(error => {
  console.log('job error: ', error);
});

// start http server
listen((error, { httpPort }) => {
  console.log('http error: ', error);
  console.log(`Open: http://0.0.0.0:${httpPort}`);
});

// dispatch works
setInterval(() => {
  dispatch({ type: 'email', data: { to: 'l@j.z' } });
}, 2000)
