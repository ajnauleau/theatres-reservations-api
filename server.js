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

// Mongodb connect
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

    //client.close();
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
router.get('/theaters/:theaterId/sessions/:sessionId/new', function(req, res) {
  // Test it
  res.json({
    stub: `[${req.originalUrl}] Endpoint works!`
  });

  const theaterId = req.params.theaterId;
  const theaters = db.collection('theaters');
  const sessions = db.collection('sessions');
  let theater = theaters.findOne({ _id: theaterId });
  sessions.insertOne(
    {
      name: 'Action Bronson',
      description: 'Another action movie',
      start: new Date('2015-03-11T15:00:00.000Z').toISOString(),
      end: new Date('2015-03-11T16:00:00.000Z').toISOString(),
      price: 10,
      seatsAvailable: theater.seatsAvailable,
      seats: theater.seats,
      reservations: []
    },
    (err, result) => {
      console.log('Inserted new session! STDOUT: ' + result);
    }
  );
});

// reserve seats on session
router.get(
  '/theaters/:theaterId/sessions/:sessionId/carts/:cartId/new',
  function(req, res) {
    // Test it
    res.json({
      stub: `[${req.originalUrl}] Endpoint works!`
    });

    const sessionId = req.params.sessionId;
    const cartId = req.params.cartId;

    const seats = [[1, 5], [1, 6]];
    const seatsQuery = [];
    const setSeatsSelection = {};

    const sessions = db.collection('sessions');
    const session = sessions.find({ _id: sessionId });

    for (let i = 0; i < seats.length; i++) {
      let seatSelector = {};
      let seatSelection = 'seats.' + seats[i][0] + '.' + seats[i][1];
      // Part of $and query to check if seat is free
      seatSelector[seatSelection] = 0;
      seatsQuery.push(seatSelector);
      // Part of $set operation to set seat as occupied
      setSeatsSelection[seatSelection] = 1;
    }

    const result = sessions.updateOne(
      {
        _id: sessionId,
        $and: seatsQuery
      },
      {
        $set: setSeatsSelection,
        $inc: { seatsAvailable: -seats.length },
        $push: {
          reservations: {
            _id: cartId,
            seats: seats,
            price: session.price,
            total: session.price * seats.length
          }
        }
      },
      (err, result) => {
        console.log('Updated new cart! STOUT: ' + result);
      }
    );
    // Failed to reserve seats
    if (result === 0) {
      //.result.nModified == 0
      console.log('Err failed to reserve seats');

      sessions.updateMany(
        {
          _id: 1,
          $and: [{ 'seats.1.5': 0 }, { 'seats.1.6': 0 }]
        },
        {
          $set: { 'seats.1.5': 1, 'seats.1.6': 1 },
          $inc: { seatsAvailable: 2 },
          $push: {
            reservations: {
              _id: 1,
              seats: [[1, 5], [1, 6]],
              price: 10,
              total: 20
            }
          }
        }
      );

      res.redirect('/theaters/:theaterId/sessions/:sessionId/new');
    }
    // Reservation was successful
    if (result === 1) {
      //.result.nModified == 1
      console.log('Reservation was successful for seats');
    }
  }
);

// save seats in session to cart
router.get(
  '/theaters/:theaterId/sessions/:sessionId/carts/:cartId/save',
  function(req, res) {
    // Test it
    res.json({
      stub: `[${req.originalUrl}] Endpoint works!`
    });

    const sessionId = req.params.sessionId;
    const cartId = req.params.cartId;

    const seats = [[1, 5], [1, 6]];
    const seatsQuery = [];
    const setSeatsSelection = {};

    const sessions = db.collection('sessions');
    const carts = db.collection('carts');
    const session = sessions.find({ _id: sessionId });

    const result = carts.updateMany(
      {
        _id: cartId
      },
      {
        $push: {
          reservations: {
            sessionId: sessionId,
            seats: seats,
            price: session.price,
            total: session.price * seats.length
          }
        },
        $inc: { total: session.price * seats.length },
        $set: { modifiedOn: new Date() }
      },
      (err, result) => {
        console.log('Saved seats to cart! STDOUT: ' + result);
      }
    );

    // Failed to reserve seats
    if (result === 0) {
      //.result.nModified == 0
      console.log('Err failed to reserve seats');
      res.redirect(
        '/theaters/:theaterId/sessions/:sessionId/carts/:cartId/release'
      );
    }
    // Reservation was successful
    if (result === 1) {
      //result.nModified == 1
      console.log('Reservation was successful for seats');
    }
  }
);

// release seat reservations from sessions in cart
router.get(
  '/theaters/:theaterId/sessions/:sessionId/carts/:cartId/release',
  function(req, res) {
    // Test it
    res.json({
      stub: `[${req.originalUrl}] Endpoint works!`
    });

    const sessionId = req.params.sessionId;
    const cartId = req.params.cartId;

    const seats = [[1, 5], [1, 6]];
    const setSeatsSelection = {};

    for (let i = 0; i < seats.length; i++) {
      setSeatsSelection['seats.' + seats[i][0] + '.' + seats[i][1]] = 0;
    }

    const sessions = db.collection('sessions');
    sessions.updateMany(
      {
        _id: sessionId
      },
      {
        $set: setSeatsSelection,
        $pull: { reservations: { _id: cartId } }
      },
      (err, result) => {
        // Get results
        console.log('Release seats from cart! STDOUT: ' + result);

        // Failed to release seats
        if (result.nModified === 0) {
          //result.nModified == 0
          console.log('Err failed to release seats');
          res.redirect(
            '/theaters/:theaterId/sessions/:sessionId/carts/:cartId/new'
          );
        }
        // Release of seats was successful
        if (result.nModified === 1) {
          //result.nModified == 1
          console.log('Reservation was successful for seats');
        }
      }
    );
  }
);

// checkout cart and make receipt
router.get(
  '/theaters/:theaterId/sessions/:sessionId/carts/:cartId/receipts/:receiptId/new',
  function(req, res) {
    // Test it
    res.json({
      stub: `[${req.originalUrl}] Endpoint works!`
    });

    const cartId = req.params.cartId;

    const carts = db.collection('carts');
    const receipts = db.collection('receipts');

    const cart = carts.findOne({ _id: cartId });

    receipts.insertOne({
      createdOn: new Date(),
      reservations: cart.reservations,
      total: cart.total
    });

    // remove reservations in cart from sessions
    const sessions = db.collection('sessions');

    sessions.updateOne(
      {
        'reservations._id': cartId
      },
      {
        $pull: { reservations: { _id: cartId } }
      }, //false, true
      (err, result) => {
        console.log(
          'Remove persistent reservations in sessions! STDOUT: ' + result
        );
      }
    );

    // mark cart as done
    carts.updateOne(
      {
        _id: cartId
      },
      {
        $set: { state: 'done' }
      },
      (err, result) => {
        console.log('Mark cart as done! STDOUT: ' + result);
      }
    );
  }
);

// cart expires so release reservations
router.get(
  '/theaters/:theaterId/sessions/:sessionId/carts/:cartId/expires',
  function(req, res) {
    // Test it
    res.json({
      stub: `[${req.originalUrl}] Endpoint works!`
    });

    let cutOffDate = new Date();
    cutOffDate.setMinutes(cutOffDate.getMinutes() - 30);

    const cartsCol = db.collection('carts');
    cartsCol.createIndexes({ state: 1 });
    const sessionsCol = db.collection('sessions');
    sessionsCol.createIndexes({ 'reservations._id': 1 });

    const carts = cartsCol.find({
      modifiedOn: { $lte: cutOffDate },
      state: 'active'
    });

    // Process all carts
    while (carts.hasNext()) {
      let cart = carts.next();

      // !Fix un resolved pending promise
      if (cart !== undefined) {
        // Process all reservations in the cart
        for (let i = 0; i < cart.reservations.length; i++) {
          let reservation = cart.reservations[i];
          let seats = reservation.seats;
          let setSeatsSelection = {};

          for (let i = 0; i < seats.length; i++) {
            setSeatsSelection['seats.' + seats[i][0] + '.' + seats[i][1]] = 0;
          }

          // Release seats and remove reservation
          sessionsCol.updateMany(
            {
              _id: reservation._id
            },
            {
              $set: setSeatsSelection,
              $pull: { reservations: { _id: cart._id } }
            }
          );
        }

        // Set the cart to expired
        cartsCol.updateMany(
          {
            _id: cart._id
          },
          {
            $set: { status: 'expired' }
          }
        );
      } else {
        console.log('Err carts not full, nothing to expire.');
      }
    }
  }
);

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
        console.log('Inserted theaters! STDOUT: ' + result);
      }
    );
  });

app
  .route('/sessions/')
  .get(function(req, res) {
    const collection = db.collection('sessions');

    // Find some documents
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      res.json(docs);
    });
    // res.send('Get a session: ' + req.params.session);
  })
  .post(function(req, res) {
    res.send('Post a session: ' + req.params.session);
  });

app
  .route('/carts/')
  .get(function(req, res) {
    const collection = db.collection('carts');

    // Find some documents
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      res.json(docs);
    });
    //res.send('Get a cart: ' + req.params.cart);
  })
  .post(function(req, res) {
    res.send('Post a cart: ' + req.params.cart);
  });

app
  .route('/receipts/')
  .get(function(req, res) {
    const collection = db.collection('receipts');

    // Find some documents
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      res.json(docs);
    });
    //res.send('Get a receipt: ' + req.params.receipt);
  })
  .post(function(req, res) {
    res.send('Post a receipt: ' + req.params.receipt);
  });

module.exports = router;
