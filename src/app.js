const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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


