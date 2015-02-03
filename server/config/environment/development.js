'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/pah-dev'
  },

  twilio: {
  	sid: 'ACdf98657c40965919ec09531bd5cdffeb',
  	auth: 'd76e345c66a9f17020b783a4e52192c0'
  },

  seedDB: true
};
