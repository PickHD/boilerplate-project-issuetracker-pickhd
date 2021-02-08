'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

let app = express();

mongoose.connect(process.env.DB, { useUnifiedTopology: false, useNewUrlParser: true, useFindAndModify: false })
  .then(() => console.log("Database Connected!"))
  .catch(async (e) => {
    console.error(`Cannot connect to database, reason: \n${e}`)
    await mongoose.disconnect()
  })

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Sample front-end
app.route('/:project/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404)
    .type('text')
    .send('Not Found');
});


//Start our server and tests!
app.listen(process.env.PORT || 3000, () => {

  console.log("Listening on port " + process.env.PORT);

  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        let error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 10000);
  }
});

module.exports = app