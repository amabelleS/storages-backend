const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/api/auth');
const usersRoutes = require('./routes/api/users');

const httpError = require('./models/http-error');

dotenv.config();

const app = express();

// Connect database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

// Define Routes
app.use('/api/users', usersRoutes);
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/storages', require('./routes/api/storages'));

app.use((req, res, next) => {
  const error = new httpError('Could not find this route', 404);
  return next(error);
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server runninig in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
