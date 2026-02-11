const { createReader } = require('../helper/helperNsq');

const readerTopic = 'test_topic';

const example_jmtHandler = async (msg) => {
  try {
    const data = msg.json();
    console.log('Received message from NSQ:', data);
    // Process the message here (e.g., save to MongoDB, etc.)
  } catch (error) {
    console.error('Error processing NSQ message:', error);
  }
  msg.finish();
};

const init_nsq_test_topic = () => {
  const reader = createReader(readerTopic, 'example_jmt_channel', {
    maxInFlight: 5,
    maxAttempts: 5,
    requeueDelay: 60000,
    messageTimeout: 30000,
  });
  reader.on('message', example_jmtHandler);

  reader.on('ready', () => {
    console.log( 'example_jmt started' );
  });

  reader.on('not_ready', () => {
    console.log( 'example_jmt not_ready' );
  });

  reader.on('discard', (msg) => {
    console.warn( 'example_jmt discard', msg.json() );
  });

  reader.on('error', (error) => {
    console.error( 'example_jmt error', error );
  });

  reader.on('nsqd_connected', () => {
    console.log( 'example_jmt nsqd_connected' );
  });

  reader.on('nsqd_closed', () => {
    console.warn( 'example_jmt nsqd_closed' );
  });

  reader.connect();

  return reader;
};

module.exports = {
  init_nsq_test_topic,
};
