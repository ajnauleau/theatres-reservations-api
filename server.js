// call requires
const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const mongoDB = require('mongodb');

// express modules
const router = express.Router();
const app = express();

// Use Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator()); // Add after Body parser!

// connect to mongo and send db
// require("./database.js");

/* Mongo Database Connection */

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017/';

// Database Name
const dbName = 'theatres';

// Init db global
let db = {};

MongoClient.connect(
  url,
  { useNewUrlParser: true },
  async function(err, client) {
    assert.equal(null, err);
    console.log('Connected successfully to database');
    db = await client.db(dbName);

    db.collection('theatres');
    db.collection('sessions');

    // serve it up
    app.set('port', process.env.PORT);
    app.set('port', 3000);

    if (!module.parent) {
      app.listen(app.get('port'), () => {
        console.log('Server is running on port 3000');
      });
    }

    client.close();
  }
);

/*

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

  Route path: /users/:userId/books/:bookId
  Request URL: http://localhost:3000/users/34/books/8989
  req.params: { "userId": "34", "bookId": "8989" }

*/

// routes
app.use('/', router);

// insert new session
router.get('/theaters/:theaterId/:theaterName/new', function(req, res) {
  // Test it
  res.json({
    stub: `[${req.originalUrl}] Endpoint works! Replace me in Step 2.`
  });

  const theaterId = req.params.theaterId;
  const theaters = db.collection('theaters');
  const sessions = db.collection('sessions');
  let theater = theaters.findOne({ _id: theaterId });
  sessions.insert(
    {
      name: req.params.theaterName,
      description: 'Another action movie',
      start: ISODate('2015-03-11T15:00:00.000Z'),
      end: ISODate('2015-03-11T16:00:00.000Z'),
      price: 10,
      seatsAvailable: theater.seatsAvailable,
      seats: theater.seats,
      reservations: []
    },
    (err, result) => {
      console.log('Inserted theaters!');
    }
  );
});

// theatres index - show all theatres
app
  .route('/theaters/')
  .get(function(req, res) {
    const collection = db.collection('theaters');

    // Find some documents
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      res.json(docs);
    });
  })
  .post(function(req, res) {
    res.send('Insert theaters');

    // insert theaters
    const collection = db.collection('theaters');
    collection.insertMany(
      [
        {
          _id: 1,
          name: 'The Royal',
          seats: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          ],
          seatsAvailable: 80
        },
        {
          _id: 2,
          name: 'The Gorilla',
          seats: [[0, 0, 0], [0, 0, 0, 0, 0]],
          seatsAvailable: 8
        },
        {
          _id: 3,
          name: 'The Grand',
          seats: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          ],
          seatsAvailable: 96
        }
      ],
      (err, result) => {
        console.log('Inserted theaters!');
      }
    );
  });

app
  .route('/sessions/:sessionId/')
  .get(function(req, res) {
    res.send('Get a session: ' + req.params.session);
  })
  .post(function(req, res) {
    res.send('Post a session: ' + req.params.session);
  });

app
  .route('/reserves/:reserveId/')
  .get(function(req, res) {
    res.send('Get a session: ' + req.params.reserve);
  })
  .post(function(req, res) {
    res.send('Post a session: ' + req.params.reserve);
  });

app
  .route('/carts/:cartId/')
  .get(function(req, res) {
    res.send('Get a session: ' + req.params.cart);
  })
  .post(function(req, res) {
    res.send('Post a session: ' + req.params.cart);
  });

app
  .route('/receipts/:receiptId/')
  .get(function(req, res) {
    res.send('Get a session: ' + req.params.receipt);
  })
  .post(function(req, res) {
    res.send('Post a session: ' + req.params.receipt);
  });

module.exports = router;
