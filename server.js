// call requires
const express = require("express");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const mongoDB = require("mongodb");

// express modules
const router = express.Router();
const app = express();

// Use Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator()); // Add after Body parser!

// connect to db
const db = require("./database.js");

// serve it up
app.set("port", process.env.PORT);
app.set("port", 3000);

if (!module.parent) {
  app.listen(app.get("port"), () => {
    console.log("Server is running on port 3000");
  });
}

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
app.use("/", router);

router.get("/theater/name-of-route", function(req, res) {
  res.json({
    stub: `[${req.originalUrl}] Endpoint works! Replace me in Step 2.`
  });

  let theaterId = 1;
  let theaters = db.getSisterDB("booking").theaters;
  let sessions = db.getSisterDB("booking").sessions;

  let theater = theaters.findOne({ _id: theaterId });
  sessions.insert({
    name: "Action Movie 5",
    description: "Another action movie",
    start: ISODate("2015-03-11T15:00:00.000Z"),
    end: ISODate("2015-03-11T16:00:00.000Z"),
    price: 10,
    seatsAvailable: theater.seatsAvailable,
    seats: theater.seats,
    reservations: []
  });
});

app
  .route("/sessions/:session/")
  .get(function(req, res) {
    res.send("Get a session: " + req.params.session);
  })
  .post(function(req, res) {
    res.send("Post a session: " + req.params.session);
  });

app
  .route("/reserves/:reserve/")
  .get(function(req, res) {
    res.send("Get a session: " + req.params.reserve);
  })
  .post(function(req, res) {
    res.send("Post a session: " + req.params.reserve);
  });

app
  .route("/carts/:cart/")
  .get(function(req, res) {
    res.send("Get a session: " + req.params.cart);
  })
  .post(function(req, res) {
    res.send("Post a session: " + req.params.cart);
  });

app
  .route("/receipts/:receipt/")
  .get(function(req, res) {
    res.send("Get a session: " + req.params.receipt);
  })
  .post(function(req, res) {
    res.send("Post a session: " + req.params.receipt);
  });

module.exports = router;
