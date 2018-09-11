// call requires
const express = require('express');
const bodyParser = require('body-parser');
const mongoDB = require('mongodb');

// express modules
const router = express.Router();
const app = express();

// Use Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator()); // Add after Body parser!

// connect to db
require('./database.js');

theatres;
sessions;
reservations;
carts;

       1. Sessions >
     2. Reserving seats >       6b. Carts mark expired
3a. Sessions update/reserve > 4. Carts add reservations > 5. Receipt create >
< 3b. Sessions release/destroy  6. Carts remove reservations 
                                  7. Carts mark done >

  Theatres > secondaries
  Sessions > primaries

// routes

router.get('/theater/name-of-route', function(req, res) {
  res.json({'stub': `[${req.originalUrl}] Endpoint works! Replace me in Step 2.`});
});

app.get('/:sessions/', function(req, res) {

});

app.get('/:reserve/', function(req, res) {

});

app.get('/:carts/', function(req, res) {

});

app.get('/:receipt/', function(req, res) {

});

module.exports = router;