const express = require('express');
let app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./api/routes/users');
const galleryRoutes = require('./api/routes/gallery');

mongoose.connect('mongodb+srv://roman:' + process.env.MONGO_ATLAS_PW + '@personalphotows-nyrgt.mongodb.net/test?retryWrites=true' +
  {
    useMongoClient: true
  },
  {
    useNewUrlParser: true
  }
  );

// Morgan for logs
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '50mb', extended: true, type:'application/json'}));



// Handling CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// Routes
app.use('/user', userRoutes);
app.use('/gallery', galleryRoutes);

// Handling errors
app.use((req, res, next) => {
  error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;