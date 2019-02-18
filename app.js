'use strict';


// load modules
const express = require('express'); //This imports the Express Module
const morgan = require('morgan'); // THis is for logging the requests to the console
const jsonParser = require('body-parser').json;
var mongoose = require('mongoose');
var router = require('./Routes');
// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

mongoose.connect("mongodb://localhost:27017/fsjstd-restapi", {useNewUrlParser: true})
  .then(() => console.log("Great"), (err) => {console.log(err)})
  .catch(err => {console.log(err)})


var db = mongoose.connection;

db.on("MongoNetworkError", (err) => {
    console.error("connection error:", err)
});

db.once("open", () => {
    console.log("db connection successful");
}, (err) => {console.log(err)}).catch(err => {console.log(err)});

app.use(morgan("dev"));
app.use(jsonParser()); 
// creating the routers
app.use("/api", router);
// setup morgan which gives us http request logging
app.use(morgan('dev'));


// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
    message2: 'hi there',
    message3: 'hi there'
    
  });
});

// send 404 if no other route matched //Looks like this is where the 404 error is caught
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {status: err.status},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
