'use strict';


// load modules
const express = require('express'); //This imports the Express Module
const morgan = require('morgan'); // This is for logging the requests to the console
const jsonParser = require('body-parser').json; //parses the body of the request
var mongoose = require('mongoose'); //for creating schemas
var router = require('./Routes'); //allows for the use of the routes file
// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();
//if connection fails a connection error is logged to the console
mongoose.connect("mongodb://localhost:27017/fsjstd-restapi", {useNewUrlParser: true}, function(err, db){
  if (err) {
    console.log("db failed to connect");
  }
});

var db = mongoose.connection;

db.once("open", () => {
    console.log("db connection successful");
});
//route traffic though both morgan and jsonparser
app.use(morgan("dev"));
app.use(jsonParser()); 
// creating the routers
app.use("/api", router);
// setup morgan which gives us http request logging
app.use(morgan('dev'));


// This is the home route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Home!'
    
  });
});

// catches 404 erros
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {status: err.status},
  });
});

// sets  port
app.set('port', process.env.PORT || 5000);

// starts listening on port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
