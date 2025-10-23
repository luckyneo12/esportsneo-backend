const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// Configure CORS
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: ['text/plain', 'application/json'] }));
app.use((req, res, next) => {
  if (typeof req.body === 'string') {
    try { req.body = JSON.parse(req.body); } catch (_) {}
  }
  next();
});
app.use(routes);

module.exports = { app };


