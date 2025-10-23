const { app } = require('../src/app');

// Export handler for Vercel serverless function
module.exports = (req, res) => {
  return app(req, res);
};
